import {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterUserForm({showSuccess, showError, setAuth}) {

  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    console.log('email:', email);

    try {
      const response = await axios.post(
        'http://localhost:2024/api/user/register',
        { givenName, familyName, email, password, role },
        { withCredentials: true }
      );
      showSuccess('User registered successfully');
      navigate('/list');
      localStorage.setItem('auth', JSON.stringify(response.data));
      setAuth(response.data);
    } catch (err) {
      console.log(err);
      showError('Error registering user');
    }
  }

  return(
    <>
      <form onSubmit={(evt) => handleSubmit(evt)}>
        <div className="mb-3">
        <div className="mb-3">
           <label htmlFor="exampleInputGivenName" className="form-label">Given Name</label>
           <input type="text" className="form-control" id="exampleInputGivenName" required onChange={(evt) => setGivenName(evt.target.value)}/>
          </div>

          <label htmlFor="exampleInputFamilyName" className="form-label">Family Name</label>
           <input type="text" className="form-control" id="exampleInputFamilyName" required onChange={(evt) => setFamilyName(evt.target.value)}/>
          </div>

          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required onChange={(evt) => setEmail(evt.target.value)} />
          <div id="emailHelp" className="form-text">We&apos;ll never share your email with anyone else.</div>
        

          <div className="mb-3">
           <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
           <input type="password" className="form-control" id="exampleInputPassword1" required onChange={(evt) => setPassword(evt.target.value)}/>
          </div>

          <div className="mb-3">
           <label htmlFor="exampleInputRole" className="form-label">Role</label>
           <input type="ext" className="form-control" id="exampleInputRole" required onChange={(evt) => setRole(evt.target.value)}/>
          </div>
           
          <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </>
  )
}
