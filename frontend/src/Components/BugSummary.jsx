//import {useState, useEffect} from 'react';
import './BugSummary.css';
//import axios from 'axios';
import PropTypes from "prop-types";

export default function BugSummary({ bug, onEdit, onDelete }) {
  return (
    <li>
      <h3>{bug.title}</h3>
      <p>{bug.description}</p>
      <button onClick={() => onEdit(bug)}>Edit</button>
      <button onClick={() => onDelete(bug.id)}>Delete</button>
    </li>
  );
}

BugSummary.propTypes = {
  bug: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

