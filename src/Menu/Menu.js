import {
  Link
} from "react-router-dom";

function Menu() {
  return (
    <nav role="navigation">
        <ul>
            <li><Link to="/" aria-label="go to homepage">Homepage</Link></li>
            <li><Link to="/about" aria-label="learn about the app">About</Link></li>
            <li><Link to="/login" aria-label="login to the app">Login</Link></li>
        </ul>
    </nav>
  );
}

export default Menu;