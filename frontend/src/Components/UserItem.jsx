import pencil from '../../node_modules/bootstrap-icons/icons/pencil.svg';
import trash from '../../node_modules/bootstrap-icons/icons/trash.svg';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';


export default function UserItem({ user, handleDelete, handleEdit }) {
  const [showModal, setShowModal] = useState(false);

  console.log('handleDelete in UserItem:', handleDelete);

  if (!user) return null; 

  return (
    <>
      <div className="col-md-4">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">
              {user.givenName} - {user.familyName} - {user.email} - {user.role}
            </h5>

            <NavLink to={`/user/${user._id}`} className="btn btn-primary me-2" onClick={() => handleEdit(user)}>
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
                <p>Are you sure you want to delete {user.givenName}?</p>
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
                    console.log("Deleting user ID:", user._id);
                    handleDelete(user._id);
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