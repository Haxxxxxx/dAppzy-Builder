// BuilderPageLoader.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { EditableContext } from "./context/EditableContext";
import BuilderPageCore from "./BuilderPageCore"; // Core builder rendering component
import WalletConnection from "./NewLogin/WalletConnection";

function BuilderPageLoader({ userId, setUserId, projectId: propProjectId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true); // true until Firestore fetch completes
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);
  const [projects, setProjects] = useState([]); // State for multiple projects
  const [activeProjectId, setActiveProjectId] = useState(null); // Track active project
  const [internProjectId, setInternProjectId] = useState(null);
  const { setSelectedElement, setElements, elements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableCanvasWidth, setAvailableCanvasWidth] = useState(0);
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
  });

  // Set logged-in status once userId is available.
  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
    }
  }, [userId]);

  // Helper: Check how many projects exist for this user.
  const checkProjectLimit = async (uid) => {
    const projectsRef = collection(db, "projects", uid, "ProjectRef");
    const q = query(projectsRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  // (1) Load project data from URL query parameters and Firestore.
  useEffect(() => {
    if (!userId) return;
    
    // Clear any existing local storage data
    localStorage.removeItem('editableElements');
    localStorage.removeItem('elementsVersion');
    localStorage.removeItem('websiteSettings');
    
    const params = new URLSearchParams(window.location.search);
    const qProjectId = params.get("projectId");
    setInternProjectId(qProjectId);
    
    if (qProjectId) {
      if (qProjectId === "new") {
        // Before creating a new project, check the project limit.
        checkProjectLimit(userId).then((count) => {
          if (count >= 3) {
            alert("You have reached the maximum number of projects (3).");
          } else {
            createUserProject({
              elements: [],
              websiteSettings: pageSettings,
              thumbnailUrl: "",
              siteTitle: "Untitled Project",
            }).then((newProjectId) => {
              // Update URL to include the new projectId.
              const newUrl = `${window.location.origin}${window.location.pathname}?userId=${userId}&projectId=${newProjectId}`;
              window.history.replaceState(null, "", newUrl);
              loadProjectById(newProjectId);
              setInternProjectId(newProjectId);
            });
          }
        });
      } else {
        loadProjectById(qProjectId);
      }
    } else {
      // No specific projectId provided—load all projects.
      loadUserProjects(userId);
    }
  }, [userId]);

  // (2) Load all projects for the user.
  const loadUserProjects = async (uid) => {
    setLoadingProject(true);
    try {
      const projectsRef = collection(db, "projects", userId, "ProjectRef");
      const q = query(projectsRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      let fetchedProjects = [];
      querySnapshot.forEach((docSnap) => {
        fetchedProjects.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProjects(fetchedProjects);
      // Don't automatically load the first project's content
      if (fetchedProjects.length > 0) {
        setActiveProjectId(fetchedProjects[0].id);
      } else {
        alert("No projects found for user: " + uid);
      }
    } catch (error) {
      console.error("Error loading user projects:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  // (3) Load a specific project by its ID.
  const loadProjectById = async (projId) => {
    setLoadingProject(true);
    try {
      const projectRef = doc(db, "projects", userId, "ProjectRef", projId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        // Clear existing elements first
        setElements([]);
        // Then set the new project's elements
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
      } else {
        alert("Project not found: " + projId);
      }
    } catch (error) {
      console.error("Error loading project by id:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  // (4) Create a new project document.
  const createUserProject = async (projectData) => {
    try {
      // Clear localStorage before creating new project
      localStorage.removeItem('editableElements');
      localStorage.removeItem('elementsVersion');
      localStorage.removeItem('websiteSettings');
      
      const projectsRef = collection(db, "projects", userId, "ProjectRef");
      // Initialize with empty elements array and default settings
      const newProjectData = {
        userId,
        elements: [], // Initialize with empty elements array
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
      console.log("Project created with ID:", docRef.id);
      // Set empty elements in the context
      setElements([]);
      loadUserProjects(userId);
      setActiveProjectId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // (5) Update an existing project document.
  const saveUserProject = async (projId, projectData) => {
    try {
      if (!projId) {
        console.error("No project ID provided for saving");
        return;
      }
      
      const projectRef = doc(db, "projects", userId, "ProjectRef", projId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        console.error("Project not found:", projId);
        return;
      }
      
      // Get current elements from context
      const currentElements = elements;
      
      // Ensure we're not duplicating data
      const existingData = projectSnap.data();
      const updatedData = {
        ...existingData,
        ...projectData,
        elements: currentElements, // Always include current elements
        lastUpdated: serverTimestamp(),
        userId: userId, // Ensure userId is always set correctly
        websiteSettings: pageSettings // Include current page settings
      };
      
      // Save to Firestore
      await setDoc(projectRef, updatedData, { merge: true });
      console.log("Project updated:", projId);
      
      // Also save to local storage for backup
      localStorage.setItem('editableElements', JSON.stringify(currentElements));
      localStorage.setItem('websiteSettings', JSON.stringify(pageSettings));
      
      // Reload projects to ensure UI is up to date
      loadUserProjects(userId);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  // (6) If not logged in, render the WalletConnection.
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

  // (7) If still loading, render a spinner.
  if (loadingProject) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your projects, please wait...</p>
      </div>
    );
  }

  // If no specific project is selected but user has projects, show project selection
  if (!internProjectId && projects.length > 0) {
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
                setInternProjectId(project.id);
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
            setInternProjectId("new");
          }}
        >
          Create New Project
        </button>
      </div>
    );
  }

  // Once loaded, render the core builder UI.
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
      saveUserProject={saveUserProject}
    />
  );
}

export default BuilderPageLoader;
