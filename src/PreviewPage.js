import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collectionGroup, query, where, getDocs } from "firebase/firestore";
import DOMPurify from "dompurify";
import { db } from "./firebase";

const PreviewPage = () => {
  // Destructure userId, projectId, and projectName from URL parameters.
  const { userId, projectId, projectName } = useParams();
  const [projectHtml, setProjectHtml] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        let projectRef;

        // If we have userId and projectId, build the correct reference.
        if (userId && projectId) {
          projectRef = doc(db, "projects", userId, "ProjectRef", projectId);
        } else {
          // Custom URL lookup across all users' ProjectRef subcollections
          const q = query(collectionGroup(db, "ProjectRef"), where("customUrl", "==", userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            projectRef = querySnapshot.docs[0].ref;
          }
        }

        if (!projectRef) {
          setError("Project not found.");
          return;
        }

        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProjectHtml(projectSnap.data().html);
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project.");
      }
    };

    fetchProject();
  }, [userId, projectId]);

  return (
    <div>
      {error ? (
        <h2>{error}</h2>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(projectHtml, {
            ADD_ATTR: ['style', 'target', 'onclick'],
            ALLOW_DATA_ATTR: true,
          }) }}
          style={{ width: "100vw", height: "100vh", overflow: "auto" }}
        />
      )}
    </div>
  );
};

export default PreviewPage;
