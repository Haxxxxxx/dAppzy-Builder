import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { storage } from "../../firebase";

export async function renameProjectFolder(oldProjectName, newProjectName, userId) {
  const oldFolderPath = `usersProjectData/${userId}/projects/${oldProjectName}`;
  const newFolderPath = `usersProjectData/${userId}/projects/${newProjectName}`;

  // Get reference to the old folder.
  const oldFolderRef = ref(storage, oldFolderPath);

  try {
    // List all files in the old folder.
    const res = await listAll(oldFolderRef);
    const promises = res.items.map(async (itemRef) => {
      // Get the file's download URL.
      const url = await getDownloadURL(itemRef);
      // Fetch the file as a Blob.
      const response = await fetch(url);
      const fileBlob = await response.blob();
      // Create a new file reference in the new folder with the same file name.
      const newFileRef = ref(storage, `${newFolderPath}/${itemRef.name}`);
      // Upload the blob to the new file reference.
      await uploadBytes(newFileRef, fileBlob);
      // Delete the old file.
      await deleteObject(itemRef);
      return itemRef.name;
    });
    const movedFiles = await Promise.all(promises);
    console.log("Moved files:", movedFiles);
  } catch (error) {
    console.error("Error renaming folder:", error);
  }
}


export function saveToLocalStorage(key, value) {
  // If all you want is to store the entire new value:
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
