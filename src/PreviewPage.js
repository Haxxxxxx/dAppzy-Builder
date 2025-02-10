import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const PreviewPage = () => {
  const { userId, customUrl } = useParams();
  const [projectHtml, setProjectHtml] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        let projectRef;

        if (userId) {
          projectRef = doc(db, "projects", userId);
        } else if (customUrl) {
          // If using custom URL, fetch based on `customUrl`
          const q = query(collection(db, "projects"), where("customUrl", "==", customUrl));
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
  }, [userId, customUrl]);

  return (
    <div>
      {error ? (
        <h2>{error}</h2>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: projectHtml }}
          style={{ width: "100vw", height: "100vh", overflow: "auto" }}
        />
      )}
    </div>
  );
};

export default PreviewPage;
