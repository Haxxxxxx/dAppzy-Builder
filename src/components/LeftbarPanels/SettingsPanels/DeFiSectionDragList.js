import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DeFiSectionDragList = ({ moduleOrder, moduleSettings, onDragEnd, onModuleToggle, onModuleRemove }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="modules">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {moduleOrder.map((type, index) => (
              <Draggable key={type} draggableId={type} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="module-item"
                  >
                    <div className="settings-row">
                      <span style={{ cursor: 'grab', marginRight: '4px' }}>⠿</span>
                      <span>{type === 'aggregator' ? 'Pool Aggregator' :
                            type === 'simulation' ? 'Investment Simulator' :
                            type === 'bridge' ? 'Cross-Chain Bridge' : type}</span>
                      <input
                        type="checkbox"
                        className="settings-switch"
                        checked={moduleSettings[type]?.enabled}
                        onChange={e => onModuleToggle(type, e.target.checked)}
                      />
                      <button
                        className="settings-btn-icon"
                        onClick={() => onModuleRemove(type)}
                        title="Remove module"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DeFiSectionDragList;
