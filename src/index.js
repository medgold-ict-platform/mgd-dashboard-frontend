import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Homepage from './containers/Homepage';
import registerServiceWorker from './registerServiceWorker';
import { withAuthenticator } from 'aws-amplify-react'
const AppWithAuth = withAuthenticator(Homepage, {includeGreetings: false});

ReactDOM.render(<AppWithAuth />, document.getElementById('root'));
registerServiceWorker();

// class Body extends React.Component {
//     render() {
//         return (
//             <div>
//                 <Homepage></Homepage>
//             </div>
//         );
//     }
// }

// ReactDOM.render(
//     <Body />,
//     document.getElementById('root')
//     );