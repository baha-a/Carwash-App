import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { withFirebase } from '../components/Firebase';
import { AuthUserContext } from '../components/Session';
import { queryStringParser } from 'src/helpers/utlis';


const SignInPage = ({ }) => {
  const user = useContext(AuthUserContext);

  if (user && user.uid) {
    redirectAfterSignin(history);
    return null;
  }

  return <div className='login-page'>
    <div className='login-container'>
      <h1>Sign In</h1>
      <SignInForm />
    </div>
  </div>
}

export const redirectAfterSignin = (history) => {
  history.replace(queryStringParser()['returnUrl'] || '/');
}


const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with an E-Mail address to
  this social account already exists. Try to login from
  this account instead and associate your social accounts on
  your personal account page.
`;


const SignInFormBase = ({ firebase }) => {
  const [state, setState] = useState({
    email: 'c@c.com',
    password: '123456',
    error: '',
  });
  const history = useHistory();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log(state.email, '=', state.password);
      await firebase.doSignInWithEmailAndPassword(state.email, state.password)
      redirectAfterSignin(history);
    } catch (error) {
      setState({ ...state, error });
    }
  }

  const onChange = event => {
    setState({ ...state, [event.target.name]: event.target.value });
  }

  return <form onSubmit={onSubmit}>
    <input
      className="sign-input"
      name="email"
      value={state.email}
      onChange={onChange}
      type="text"
      placeholder={'Email Address'}
      autoComplete="username"
    />
    <br />
    <input
      className="sign-input"
      name="password"
      value={state.password}
      onChange={onChange}
      type="password"
      placeholder={'Password'}
      autoComplete="current-password"
    />
    <br />
    <button className='btn sign-btn' disabled={state.password === '' || state.email === ''} type="submit">
      Sign In
    </button>
    {state.error && <p className='sign-error'>{state.error.message}</p>}
  </form>
}


export default SignInPage;

const SignInForm = withFirebase(SignInFormBase);
export { SignInForm };
