// BuilderPageLoader.js
import React, { useState, useEffect, useContext, useCallback, useRef, Suspense } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { EditableContext } from "./context/EditableContext";
const BuilderPageCore = React.lazy(() => import("./BuilderPageCore"));
const WalletConnection = React.lazy(() => import("./NewLogin/WalletConnection"));
import { TEMPLATES } from "./configs/templates";
const AIBuilder = React.lazy(() => import("./components/AIBuilder"));
import "./components/css/ProjectSelection.css";
import { subscriptionStorage, projectStorage, authStorage } from './utils/storageManager';
import ConfirmModal from './components/common/ConfirmModal';

function getMaxProjects() {
  const subscriptionStatus = subscriptionStorage.getStatus();
  // 'pioneer' is the current status value; 'active' is kept as legacy fallback
  const isPioneer = subscriptionStatus === 'pioneer' || subscriptionStatus === 'active';
  return { isPioneer, maxProjects: isPioneer ? 10 : 3 };
}

function BuilderPageLoader({ userId, setUserId, projectId: propProjectId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [internProjectId, setInternProjectId] = useState(null);
  const { setElements, elements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableCanvasWidth, setAvailableCanvasWidth] = useState(0);
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
  });
  const [viewState, setViewState] = useState('loading'); // 'loading', 'selection', 'builder', 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [renamingProjectId, setRenamingProjectId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const loadingTimeoutRef = useRef(null);
  const loadingWatchdogRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Helper to safely set loading state with debounce and watchdog timeout
  const setLoadingState = useCallback((isLoading) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (loadingWatchdogRef.current) {
      clearTimeout(loadingWatchdogRef.current);
    }

    if (isLoading) {
      setLoadingProject(true);
      setViewState('loading');
      // Watchdog: if still loading after 15s, show error
      loadingWatchdogRef.current = setTimeout(() => {
        setLoadingProject(false);
        setErrorMessage('Loading timed out. Please check your connection and try again.');
        setViewState('error');
      }, 15000);
    } else {
      if (loadingWatchdogRef.current) {
        clearTimeout(loadingWatchdogRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        setLoadingProject(false);
      }, 300);
    }
  }, []);

  // Helper: Check how many projects exist for this user.
  const checkProjectLimit = useCallback(async (uid) => {
    const projectsRef = collection(db, "projects", uid, "ProjectRef");
    const q = query(projectsRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }, []);

  // Load all projects for the user.
  const loadUserProjects = useCallback(async (uid) => {
    setLoadingState(true);
    try {
      const projectsRef = collection(db, "projects", uid, "ProjectRef");
      const q = query(projectsRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      let fetchedProjects = [];
      querySnapshot.forEach((docSnap) => {
        fetchedProjects.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProjects(fetchedProjects);
      
      // Check URL parameters
      const params = new URLSearchParams(window.location.search);
      const qProjectId = params.get("projectId");
      
      if (qProjectId && qProjectId !== "new") {
        // If there's a project ID in the URL, try to load it
        const projectExists = fetchedProjects.some(p => p.id === qProjectId);
        if (projectExists) {
          setActiveProjectId(qProjectId);
          setInternProjectId(qProjectId);
          setViewState('builder');
        } else {
          setViewState('selection');
        }
      } else if (fetchedProjects.length > 0) {
        setActiveProjectId(fetchedProjects[0].id);
        setViewState('selection');
      } else {
        setViewState('selection');
      }
    } catch (error) {
      setViewState('selection');
    } finally {
      setLoadingState(false);
    }
  }, [setLoadingState]);

  // Load a specific project by its ID.
  const loadProjectById = useCallback(async (projId) => {
    if (!projId) return;
    
    setLoadingState(true);
    try {
      const projectRef = doc(db, "projects", userId, "ProjectRef", projId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        setElements([]);
        if (projectData?.elements) {
          setElements(projectData.elements);
        }
        if (projectData?.websiteSettings) {
          setPageSettings(projectData.websiteSettings);
          projectStorage.setWebsiteSettings(projectData.websiteSettings);
        } else {
          projectStorage.setWebsiteSettings(pageSettings);
        }
        setActiveProjectId(projId);
        setInternProjectId(projId);
        setViewState('builder');
      } else {
        setErrorMessage("Project not found. It may have been deleted.");
        setViewState('error');
      }
    } catch (error) {
      setErrorMessage("Failed to load project. Please try again.");
      setViewState('error');
    } finally {
      setLoadingState(false);
    }
  }, [userId, setElements, pageSettings, setLoadingState]);

  // Create a new project document.
  const createUserProject = useCallback(async (projectData) => {
    setLoadingState(true);
    try {
      projectStorage.clearProject();

      const projectsRef = collection(db, "projects", userId, "ProjectRef");
      const newProjectData = {
        userId,
        elements: [],
        websiteSettings: {
          siteTitle: "Untitled Project",
          faviconUrl: "",
          description: "",
          author: "",
        },
        thumbnailUrl: "",
        ...projectData
      };
      const docRef = await addDoc(projectsRef, newProjectData);
      setElements([]);
      await loadUserProjects(userId);
      setActiveProjectId(docRef.id);
      setInternProjectId(docRef.id);
      setViewState('builder');
      return docRef.id;
    } catch (error) {
      setViewState('selection');
    } finally {
      setLoadingState(false);
    }
  }, [userId, setElements, loadUserProjects, setLoadingState]);

  // Duplicate an existing project.
  const duplicateProject = useCallback(async (project) => {
    try {
      const count = await checkProjectLimit(userId);
      const { isPioneer, maxProjects } = getMaxProjects();
      if (count >= maxProjects) {
        setErrorMessage(isPioneer
          ? `You've reached the Pioneer limit of ${maxProjects} projects.`
          : `Free plan allows ${maxProjects} projects. Upgrade to Pioneer for more.`);
        setViewState('error');
        return;
      }
      setLoadingState(true);
      const projectsRef = collection(db, "projects", userId, "ProjectRef");
      const originalRef = doc(db, "projects", userId, "ProjectRef", project.id);
      const originalSnap = await getDoc(originalRef);
      if (!originalSnap.exists()) {
        setErrorMessage("Original project not found.");
        setViewState('error');
        return;
      }
      const originalData = originalSnap.data();
      const clonedElements = JSON.parse(JSON.stringify(originalData.elements || []));
      const clonedSettings = JSON.parse(JSON.stringify(originalData.websiteSettings || {}));
      clonedSettings.siteTitle = `Copy of ${clonedSettings.siteTitle || 'Untitled Project'}`;
      await addDoc(projectsRef, {
        userId,
        elements: clonedElements,
        websiteSettings: clonedSettings,
        thumbnailUrl: originalData.thumbnailUrl || "",
        createdAt: serverTimestamp(),
      });
      await loadUserProjects(userId);
    } catch (error) {
      setErrorMessage("Failed to duplicate project. Please try again.");
      setViewState('error');
    } finally {
      setLoadingState(false);
    }
  }, [userId, checkProjectLimit, loadUserProjects, setLoadingState]);

  // Rename a project's title.
  const renameProject = useCallback(async (projectId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const projectRef = doc(db, "projects", userId, "ProjectRef", projectId);
      await updateDoc(projectRef, { 'websiteSettings.siteTitle': newTitle.trim() });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, websiteSettings: { ...p.websiteSettings, siteTitle: newTitle.trim() } }
            : p
        )
      );
    } catch {
      setErrorMessage("Failed to rename project.");
      setViewState('error');
    }
    setRenamingProjectId(null);
  }, [userId]);

  // Delete a project.
  const deleteProject = useCallback((project) => {
    const title = project.websiteSettings?.siteTitle || 'Untitled Project';
    setConfirmModal({
      title: 'Delete Project',
      content: `Delete "${title}"? This cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        setConfirmModal(null);
        try {
          const projectRef = doc(db, "projects", userId, "ProjectRef", project.id);
          await deleteDoc(projectRef);
          setProjects((prev) => prev.filter((p) => p.id !== project.id));
          if (activeProjectId === project.id) {
            setActiveProjectId(null);
            setInternProjectId(null);
          }
        } catch {
          setErrorMessage("Failed to delete project.");
          setViewState('error');
        }
      },
    });
  }, [userId, activeProjectId]);

  // Set logged-in status once userId is available.
  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
    }
  }, [userId]);

  // Load project data from URL query parameters and Firestore.
  useEffect(() => {
    if (!userId || !isInitialLoadRef.current) return;
    
    const loadProject = async () => {
      setLoadingState(true);
      try {
        projectStorage.clearProject();

        const params = new URLSearchParams(window.location.search);
        const qProjectId = params.get("projectId");
        
        if (qProjectId) {
          if (qProjectId === "new") {
            const count = await checkProjectLimit(userId);
            const { isPioneer: isPioneerUser, maxProjects: maxP } = getMaxProjects();
            if (count >= maxP) {
              setErrorMessage(isPioneerUser
                ? `You've reached the Pioneer limit of ${maxP} projects.`
                : `Free plan allows ${maxP} projects. Upgrade to Pioneer for more.`);
              setViewState('error');
            } else {
              const newProjectId = await createUserProject({
                elements: [],
                websiteSettings: pageSettings,
                thumbnailUrl: "",
                siteTitle: "Untitled Project",
              });
              if (newProjectId) {
                const newUrl = `${window.location.origin}${window.location.pathname}?userId=${userId}&projectId=${newProjectId}`;
                window.history.replaceState(null, "", newUrl);
                await loadProjectById(newProjectId);
              }
            }
          } else {
            await loadProjectById(qProjectId);
          }
        } else {
          await loadUserProjects(userId);
        }
      } finally {
        setLoadingState(false);
        isInitialLoadRef.current = false;
      }
    };

    loadProject();
  }, [userId, checkProjectLimit, createUserProject, loadProjectById, loadUserProjects, pageSettings, setLoadingState]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
    };
  }, []);

  // If not logged in, render the WalletConnection.
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div className="app-loading">Connecting...</div>}>
        <WalletConnection
          onUserLogin={(walletKey) => {
            setIsLoggedIn(true);
            setUserId(walletKey);
            authStorage.setLoggedIn("true");
            authStorage.setUserAccount(walletKey);
          }}
        />
      </Suspense>
    );
  }

  // Render appropriate view based on viewState
  switch (viewState) {
    case 'loading':
      return (
        <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5' }}>
          <div style={{ width: '90%', maxWidth: '1200px', display: 'flex', gap: '12px', height: '80vh' }}>
            <div style={{ width: '240px', background: '#e0e0e0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ height: '48px', background: '#e0e0e0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ flex: 1, background: '#e0e0e0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }} />
            </div>
            <div style={{ width: '280px', background: '#e0e0e0', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }} />
          </div>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading your project...</p>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
        </div>
      );
    
    case 'selection':
      return (
      <>
        <div className="project-selection-container">
          <h2>Select a Project to Edit</h2>
          <div className="projects-grid">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => {
                  const newUrl = `${window.location.origin}${window.location.pathname}?userId=${userId}&projectId=${project.id}`;
                  window.history.replaceState(null, "", newUrl);
                  loadProjectById(project.id);
                }}
              >
                <div className="project-thumbnail">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.websiteSettings?.siteTitle || 'Project'} />
                  ) : (
                    <div className="placeholder-thumbnail">
                      <span>{project.websiteSettings?.siteTitle?.charAt(0) || 'P'}</span>
                    </div>
                  )}
                </div>
                <div className="project-info">
                  {renamingProjectId === project.id ? (
                    <input
                      className="project-rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameProject(project.id, renameValue);
                        if (e.key === 'Escape') setRenamingProjectId(null);
                      }}
                      onBlur={() => renameProject(project.id, renameValue)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <h3>
                      {project.websiteSettings?.siteTitle || 'Untitled Project'}
                      <button
                        className="project-rename-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingProjectId(project.id);
                          setRenameValue(project.websiteSettings?.siteTitle || '');
                        }}
                        title="Rename project"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </h3>
                  )}
                  <p>Last updated: {project.lastUpdated ? new Date(project.lastUpdated.toDate()).toLocaleDateString() : 'Never'}</p>
                </div>
                <div className="project-card-actions">
                  <button
                    className="project-duplicate-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProject(project);
                    }}
                    title="Duplicate project"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                  <button
                    className="project-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project);
                    }}
                    title="Delete project"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h3>Create New Project</h3>
          <div className="templates-grid">
            <button
              className="template-card ai-template-card"
              onClick={() => setShowAIBuilder(true)}
            >
              <span className="material-symbols-outlined template-icon">auto_awesome</span>
              <strong>AI Builder</strong>
              <span className="template-desc">Describe your project in words</span>
            </button>
            {TEMPLATES.map((template) => (
              <button
                key={template.name}
                className="template-card"
                onClick={() => {
                  setViewState('loading');
                  createUserProject({
                    elements: template.elements,
                    websiteSettings: template.websiteSettings,
                    thumbnailUrl: "",
                  });
                }}
              >
                <span className="material-symbols-outlined template-icon">{template.icon}</span>
                <strong>{template.name}</strong>
                <span className="template-desc">{template.description}</span>
              </button>
            ))}
          </div>
          {showAIBuilder && (
            <Suspense fallback={<div className="app-loading">Loading AI Builder...</div>}>
              <AIBuilder
                onProjectGenerated={(projectData) => {
                  setShowAIBuilder(false);
                  setViewState('loading');
                  createUserProject({
                    ...projectData,
                    thumbnailUrl: "",
                  });
                }}
                onClose={() => setShowAIBuilder(false)}
              />
            </Suspense>
          )}
        </div>
        {confirmModal && (
          <ConfirmModal
            open={true}
            {...confirmModal}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </>
      );
    
    case 'builder':
      return (
        <Suspense fallback={<div className="app-loading">Loading Builder...</div>}>
          <BuilderPageCore
            userId={userId}
            projectId={internProjectId}
            setUserId={setUserId}
            openPanel={openPanel}
            setOpenPanel={setOpenPanel}
            contentListWidth={contentListWidth}
            setContentListWidth={setContentListWidth}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            pageSettings={pageSettings}
            setPageSettings={setPageSettings}
            scale={scale}
            setScale={setScale}
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            availableCanvasWidth={availableCanvasWidth}
            setAvailableCanvasWidth={setAvailableCanvasWidth}
          />
        </Suspense>
      );
    
    case 'error':
      return (
        <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px' }}>
          <p style={{ color: '#e74c3c', marginBottom: '8px' }}>{errorMessage}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="create-new-project"
              onClick={() => {
                setErrorMessage(null);
                isInitialLoadRef.current = true;
                setViewState('loading');
                loadUserProjects(userId);
              }}
            >
              Retry
            </button>
            <button
              className="create-new-project"
              style={{ background: 'transparent', border: '1px solid #ccc', color: '#333' }}
              onClick={() => {
                setErrorMessage(null);
                loadUserProjects(userId);
              }}
            >
              Back to Projects
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default BuilderPageLoader;
