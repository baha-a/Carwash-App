import app from 'firebase/app';
import 'firebase/auth';
// import 'firebase/analytics';

import api from '../../infra/api';
import { tokenCookie } from '../../helpers/cookie';

const confirmationEmail = process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT;

class Firebase {
  constructor() {
    app.initializeApp({
      apiKey: process.env.REACT_APP_API_KEY,
      authDomain: process.env.REACT_APP_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_PROJECT_ID,
      messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
      measurementId: process.env.REACT_APP_MEASUREMENT_ID,
      appId: process.env.REACT_APP_ID,
    });

    // this.analytics = app.analytics();
    this.emailAuthProvider = app.auth.EmailAuthProvider;
    this.auth = app.auth();
  }

  // doCreateUserWithEmailAndPassword = (email, password, username) =>
  //   this.auth.createUserWithEmailAndPassword(email, password)
  //     .then(async authUser =>
  //       await api.newUserRegistered({
  //         uid: authUser.user.uid,
  //         email,
  //         username,
  //         authUser,
  //       }))
  //     .then(this.doSendEmailVerification);

  doSignInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password);
  // doSignInWithGoogle = () => this.auth.signInWithPopup(new app.auth.GoogleAuthProvider());
  // doSignInWithFacebook = () => this.auth.signInWithPopup(new app.auth.FacebookAuthProvider());
  // doSignInWithTwitter = () => this.auth.signInWithPopup(new app.auth.TwitterAuthProvider());
  doSignOut = () => this.auth.signOut();
  // doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
  // doSendEmailVerification = () => this.auth.currentUser.sendEmailVerification({ url: confirmationEmail });

  // doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(async authUser => {
      if (authUser) {
        tokenCookie.set(await authUser.getIdToken());
        api.getAccountInfo()
          .then(async info => {
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              providerData: authUser.providerData,
              info: info,
              role: info.role,
            }

            next(authUser);
          })
      } else {
        tokenCookie.remove();
        fallback();
      }
    });
}


export default Firebase;
