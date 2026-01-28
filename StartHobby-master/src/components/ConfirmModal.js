import React from 'react';
import './ConfirmModal.css'; 

function ConfirmModal({ title, children, onConfirm, onCancel }) {
  return (
    // The semi-transparent background overlay
    <div className="modal-overlay" onClick={onCancel}>
      {/* The modal content box */}
      {/* e.stopPropagation() prevents a click inside the modal from closing it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="modal-button cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-button confirm-button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;