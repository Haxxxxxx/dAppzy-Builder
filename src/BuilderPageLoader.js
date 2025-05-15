// BuilderPageLoader.js
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { EditableContext } from "./context/EditableContext";
import BuilderPageCore from "./BuilderPageCore";
import WalletConnection from "./NewLogin/WalletConnection";

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
  const [viewState, setViewState] = useState('loading'); // 'loading', 'selection', 'builder'

  const loadingTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Helper to safely set loading state with debounce
  const setLoadingState = useCallback((isLoading) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    if (isLoading) {
      setLoadingProject(true);
      setViewState('loading');
    } else {
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
      console.error("Error loading projects:", error);
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
          localStorage.setItem("websiteSettings", JSON.stringify(projectData.websiteSettings));
        } else {
          localStorage.setItem("websiteSettings", JSON.stringify(pageSettings));
        }
        setActiveProjectId(projId);
        setInternProjectId(projId);
        setViewState('builder');
      } else {
        alert("Project not found: " + projId);
        setViewState('selection');
      }
    } catch (error) {
      console.error("Error loading project:", error);
      setViewState('selection');
    } finally {
      setLoadingState(false);
    }
  }, [userId, setElements, pageSettings, setLoadingState]);

  // Create a new project document.
  const createUserProject = useCallback(async (projectData) => {
    setLoadingState(true);
    try {
      localStorage.removeItem('editableElements');
      localStorage.removeItem('elementsVersion');
      localStorage.removeItem('websiteSettings');
      
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
      console.error("Error creating project:", error);
      setViewState('selection');
    } finally {
      setLoadingState(false);
    }
  }, [userId, setElements, loadUserProjects, setLoadingState]);

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
        localStorage.removeItem('editableElements');
        localStorage.removeItem('elementsVersion');
        localStorage.removeItem('websiteSettings');
        
        const params = new URLSearchParams(window.location.search);
        const qProjectId = params.get("projectId");
        
        if (qProjectId) {
          if (qProjectId === "new") {
            const count = await checkProjectLimit(userId);
            if (count >= 3) {
              alert("You have reached the maximum number of projects (3).");
              setViewState('selection');
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // If not logged in, render the WalletConnection.
  if (!isLoggedIn) {
    return (
      <WalletConnection
        onUserLogin={(walletKey) => {
          setIsLoggedIn(true);
          setUserId(walletKey);
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("userAccount", walletKey);
        }}
      />
    );
  }

  // Render appropriate view based on viewState
  switch (viewState) {
    case 'loading':
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your projects, please wait...</p>
        </div>
      );
    
    case 'selection':
      return (
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
                  <h3>{project.websiteSettings?.siteTitle || 'Untitled Project'}</h3>
                  <p>Last updated: {project.lastUpdated ? new Date(project.lastUpdated.toDate()).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="create-new-project"
            onClick={() => {
              const newUrl = `${window.location.origin}${window.location.pathname}?userId=${userId}&projectId=new`;
              window.history.replaceState(null, "", newUrl);
              setViewState('loading');
              createUserProject({
                elements: [],
                websiteSettings: pageSettings,
                thumbnailUrl: "",
                siteTitle: "Untitled Project",
              });
            }}
          >
            Create New Project
          </button>
        </div>
      );
    
    case 'builder':
      return (
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
      );
    
    default:
      return null;
  }
}

export default BuilderPageLoader;
