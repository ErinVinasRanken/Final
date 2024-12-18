import pencil from '../../node_modules/bootstrap-icons/icons/pencil.svg';
import trash from '../../node_modules/bootstrap-icons/icons/trash.svg';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';


export default function BugItem({ bug, handleDelete, handleEdit }) {
  const [showModal, setShowModal] = useState(false);

  console.log('handleDelete in BugItem:', handleDelete);

  if (!bug) return null; 

  return (
    <>
      <div className="col-md-4">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">
              {bug.title} - {bug.description} - {bug.stepsToReproduce}
            </h5>

            <NavLink to={`/bug/${bug._id}`} className="btn btn-primary me-2" onClick={() => handleEdit(bug)}>
              <img src={pencil} alt="edit" /> Edit
            </NavLink>

            <button className="btn btn-danger" onClick={() => setShowModal(true)}>
              <img src={trash} alt="Delete" /> Delete
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete {bug.title}?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    console.log('Deleting bug ID:', bug._id);
                    handleDelete(bug._id);
                    setShowModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
