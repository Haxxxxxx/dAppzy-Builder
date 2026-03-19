import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getModuleLabel as getDefiModuleLabel } from '../../../constants/defiModuleTypes';

const DeFiSectionDragList = ({ moduleOrder, moduleSettings, onDragEnd, onModuleToggle, onModuleRemove, getModuleLabel = getDefiModuleLabel }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="modules">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {moduleOrder.map((moduleId, index) => {
              const info = moduleSettings[moduleId];
              const mType = info?.moduleType || 'aggregator';
              return (
                <Draggable key={moduleId} draggableId={moduleId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="module-item"
                    >
                      <div className="settings-row">
                        <span style={{ cursor: 'grab', marginRight: '4px' }}>⠿</span>
                        <span>{getModuleLabel(mType)}</span>
                        <input
                          type="checkbox"
                          className="settings-switch"
                          checked={info?.enabled}
                          onChange={e => onModuleToggle(moduleId, e.target.checked)}
                        />
                        <button
                          className="settings-btn-icon"
                          onClick={() => onModuleRemove(moduleId)}
                          title="Remove module"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DeFiSectionDragList;
