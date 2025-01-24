import React, { useContext } from 'react';
import { EditableContext } from '../../../../context/EditableContext';
import CollapsibleSection from '../LinkSettings/CollapsibleSection';
import '../css/ListSettings.css'
const ListItemsManager = ({ localSettings, setLocalSettings }) => {
  const { elements, setElements, addNewElement, updateContent } = useContext(EditableContext);

  const handleAddItem = () => {
    if (!localSettings.id) return;

    const newId = addNewElement('list-item', 1, null, localSettings.id);

    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === localSettings.id
          ? {
            ...el,
            children: [...el.children, newId],
          }
          : el
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === localSettings.id
          ? {
            ...el,
            children: el.children.filter((childId) => childId !== itemId),
          }
          : el
      )
    );
  };

  const renderListItems = () => {
    return localSettings.items.map((itemId, index) => {
      const itemElement = elements.find((el) => el.id === itemId);

      if (!itemElement) return null;

      const handleInput = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto'; // Reset height to recalculate
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Set to scrollHeight or max-height
      };

      return (
        <div key={itemId} className="list-item-container">
          <span
            onClick={() => handleRemoveItem(itemId)}
            className="material-symbols-outlined remove-item-button"
          >
            delete
          </span>
          <textarea
            value={itemElement.content || ''}
            onInput={handleInput}
            onChange={(e) => updateContent(itemId, e.target.value)}
            placeholder={`Item ${index + 1}`}
            className="settings-input"
          />
        </div>
      );
    });
  };



  return (
    <CollapsibleSection title="List Items">
      <div className="list-items-wrapper">
        {renderListItems()}
        <div className='add-item-button' onClick={handleAddItem}>
          <span class="material-symbols-outlined">
            add
          </span>
          <button >
            Add Item
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ListItemsManager;
