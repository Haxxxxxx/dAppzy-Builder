// BuilderPageLoader.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from "firebase/firestore";
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
  const { setSelectedElement, setElements } = useContext(EditableContext);
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
    const params = new URLSearchParams(window.location.search);
    const qProjectId = params.get("projectId");
    setInternProjectId(qProjectId);
    if (qProjectId) {
      if (qProjectId === "new") {
        // Before creating a new project, check the project limit.
        checkProjectLimit(userId).then((count) => {
          if (count >= 3) {
            alert("You have reached the maximum number of projects (3).");
            // Optionally, you could redirect to the dashboard or load existing projects.
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
      if (fetchedProjects.length > 0) {
        const firstProject = fetchedProjects[0];
        if (firstProject?.elements) {
          setElements(firstProject.elements);
        }
        if (firstProject?.websiteSettings) {
          setPageSettings(firstProject.websiteSettings);
          localStorage.setItem("websiteSettings", JSON.stringify(firstProject.websiteSettings));
        } else {
          localStorage.setItem("websiteSettings", JSON.stringify(pageSettings));
        }
        setActiveProjectId(firstProject.id);
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
      const projectsRef = collection(db, "projects", userId, "ProjectRef");
      const docRef = await addDoc(projectsRef, { userId, ...projectData });
      console.log("Project created with ID:", docRef.id);
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
      const projectRef = doc(db, "projects", userId, "ProjectRef", projId);
      await updateDoc(projectRef, projectData);
      console.log("Project updated:", projId);
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
