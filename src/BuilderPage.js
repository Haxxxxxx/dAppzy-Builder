import React, { useState, useEffect, useRef, useContext } from "react";
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { EditableContext } from "./context/EditableContext";
import ContentList from "./components/Canva";
import SideBar from "./components/SideBar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./BuilderPage.css";
import LeftBar from "./components/LeftBar";
import StructurePanel from "./components/LeftbarPanels/StructurePanel";
import MediaPanel from "./components/LeftbarPanels/MediaPanel";
import WebsiteSettingsPanel from "./components/LeftbarPanels/WebsiteSettingsPanel";
import WalletConnection from "./NewLogin/WalletConnection";
import Topbar from "./components/TopBar";

function BuilderPage({ userId, setUserId, projectId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true); // Start as true until Firestore fetch completes
  const [openPanel, setOpenPanel] = useState("sidebar");
  const [contentListWidth, setContentListWidth] = useState(1200);
  const [projects, setProjects] = useState([]); // State for multiple projects
  const [activeProjectId, setActiveProjectId] = useState(null); // NEW: Track active project
  const [internProjectId, setInternProjectId] = useState(null);
  const { setSelectedElement, setElements } = useContext(EditableContext);
  const [scale, setScale] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [availableCanvasWidth, setAvailableCanvasWidth] = useState(0);

  const contentRef = useRef(null);
  const mainContentRef = useRef(null);
  useEffect(() => {
    if (userId) {
      setIsLoggedIn(true);
    }
  }, [userId]);

  /**
   * Store website settings. These are updated either from DB or from user changes in `WebsiteSettingsPanel`.
   */
  const [pageSettings, setPageSettings] = useState({
    siteTitle: "My Website",
    faviconUrl: "",
    description: "",
    author: "",
  });

  /**
   * (1) Check URL query parameters and sessionStorage for login on mount.
   * If a userId is provided in the URL, consider the user logged in and load the projects.
   */
  useEffect(() => {
    if (!userId) return;
    const params = new URLSearchParams(window.location.search);
    const qProjectId = params.get("projectId");
    setInternProjectId(qProjectId);
    if (qProjectId) {
      if (qProjectId === "new") {
        createUserProject({
          elements: [],
          websiteSettings: pageSettings,
          thumbnailUrl: "",
          siteTitle: "Untitled Project"
        }).then((newProjectId) => {
          // Update URL to include the new projectId
          const newUrl = `${window.location.origin}${window.location.pathname}?userId=${userId}&projectId=${newProjectId}`;
          window.history.replaceState(null, "", newUrl);
          loadProjectById(newProjectId);
          setInternProjectId(newProjectId)
        });
      } else {
        loadProjectById(qProjectId);
      }
    } else {
      // No specific projectId provided—load all projects and auto-load the first project if available.
      loadUserProjects(userId);
    }
  }, [userId]);


  /**
   * (3) Fetch all the project documents from Firestore for the user.
   * If at least one project exists, load the first project's elements and settings.
   */
  const loadUserProjects = async (uid) => {
    setLoadingProject(true);
    try {
      const projectsRef = collection(db, "projects", userId, 'ProjectRef');
      const q = query(projectsRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      let fetchedProjects = [];
      querySnapshot.forEach(docSnap => {
        fetchedProjects.push({ id: docSnap.id, ...docSnap.data() });
      });
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
        // NEW: Set the first project as active.
        setActiveProjectId(firstProject.id);
      } else {
        alert("No projects found for user: " + uid);
      }
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error loading user projects:", error);
    } finally {
      setLoadingProject(false);
    }
  };

  /**
   * (4) Load a specific project document by its ID.
   */
  const loadProjectById = async (projectId) => {
    setLoadingProject(true);
    try {
      const projectRef = doc(db, "projects", userId, 'ProjectRef', projectId);
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
        // NEW: Update the active project ID
        setActiveProjectId(projectId);
      } else {
        alert("Project not found: " + projectId);
      }
    } catch (error) {
      console.error("Error loading project by id:", error);
    } finally {
      setLoadingProject(false);
    }
  };


  /**
   * (5) Function to create a new project document for the user.
   */
  const createUserProject = async (projectData) => {
    try {
      const projectsRef = collection(db, "projects", userId, 'ProjectRef');
      // Add the userId to the project data before saving
      const docRef = await addDoc(projectsRef, { userId, ...projectData });
      console.log("Project created with ID:", docRef.id);
      // Refresh the projects list
      loadUserProjects(userId);
      // NEW: Set the newly created project as active
      setActiveProjectId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };


  /**
   * (6) Function to update an existing project document.
   */
  const saveUserProject = async (projectId, projectData) => {
    try {
      const projectRef = doc(db, "projects", userId, 'ProjectRef', projectId);
      await updateDoc(projectRef, projectData);
      console.log("Project updated:", projectId);
      // Refresh the projects list if needed
      loadUserProjects(userId);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  /**
   * (7) Handle user login from WalletConnection.
   */
  const handleUserLogin = (walletKey) => {
    console.log("User logged in with walletKey:", walletKey);
    setIsLoggedIn(true);
    setUserId(walletKey);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userAccount", walletKey);
    console.log("userId set in sessionStorage:", walletKey);
  };

  /**
   * (8) Builder UI handlers.
   */
  const handlePreviewToggle = () => {
    setIsPreviewMode((prev) => !prev);
  };

  const handleResize = (size) => {
    setContentListWidth(size);
  };

  /**
     * (8) Builder UI handler for updating website settings.
     * Update the active project instead of using the userId.
     */
  const handleUpdateSettings = (updatedSettings) => {
    setPageSettings(updatedSettings);
    localStorage.setItem("websiteSettings", JSON.stringify(updatedSettings));
    if (activeProjectId) {
      saveUserProject(activeProjectId, { websiteSettings: updatedSettings });
    } else {
      console.error("No active project selected for saving.");
    }
  };

  const handlePanelToggle = (panelName) => {
    setOpenPanel((prevPanel) => (prevPanel === panelName ? "" : panelName));
  };

  const handleOpenMediaPanel = () => {
    setOpenPanel((prevPanel) => (prevPanel === "media" ? prevPanel : "media"));
  };

  const handleMainContentClick = (e) => {
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      setSelectedElement(null);
    }
  };

  /**
   * (9) Compute canvas width on resize.
   */
  useEffect(() => {
    const updateCanvasWidth = () => {
      if (mainContentRef.current) {
        const { width } = mainContentRef.current.getBoundingClientRect();
        setAvailableCanvasWidth(width);
      }
    };
    updateCanvasWidth();
    window.addEventListener("resize", updateCanvasWidth);
    return () => window.removeEventListener("resize", updateCanvasWidth);
  }, []);

  /**
   * (10) Render / Return.
   */
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <WalletConnection onUserLogin={handleUserLogin} />
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your projects, please wait...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout">
        <LeftBar
          openPanel={openPanel}
          onShowSidebar={() => handlePanelToggle("sidebar")}
          onShowStructurePanel={() => handlePanelToggle("structure")}
          onShowMediaPanel={() => handlePanelToggle("media")}
          onShowSettingsPanel={() => handlePanelToggle("settings")}
        />
        <div className="app">
          <Topbar
            onResize={handleResize}
            scale={scale}
            setScale={setScale}
            isPreviewMode={isPreviewMode}
            onPreviewToggle={handlePreviewToggle}
            pageSettings={pageSettings}
            userId={userId}
            projectId={internProjectId}
          />
          <div className="content-container">
            {openPanel === "sidebar" && (
              <div className="sidebar" id="sidebar">
                <SideBar contentListWidth={contentListWidth} pageSettings={pageSettings} />
              </div>
            )}
            {openPanel === "structure" && (
              <div id="structure-panel">
                <StructurePanel />
              </div>
            )}
            {openPanel === "media" && (
              <div id="media-panel">
                <MediaPanel
                  projectName={pageSettings.siteTitle}
                  isOpen={openPanel}
                  userId={userId}
                />
              </div>
            )}
            {openPanel === "settings" && (
              <div id="settings-panel">
                <WebsiteSettingsPanel onUpdateSettings={handleUpdateSettings} userId={userId} />
              </div>
            )}
            <div
              className="main-content"
              onClick={handleMainContentClick}
              ref={mainContentRef}
            >
              <ContentList
                contentListWidth={contentListWidth}
                canvasWidth={availableCanvasWidth}
                isSideBarVisible={openPanel === "sidebar"}
                leftBarWidth={40}
                handlePanelToggle={handlePanelToggle}
                ref={contentRef}
                scale={scale}
                setScale={setScale}
                isPreviewMode={isPreviewMode}
                handleOpenMediaPanel={handleOpenMediaPanel}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default BuilderPage;
