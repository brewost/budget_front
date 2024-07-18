import { Link } from 'react-router-dom';
import '../../App.css';
import './nav.css';

const Nav = () => {
  return (
    <nav className="navbar">
      <Link to="/">
         <img src="src\assets\home_icon.png" alt="home icon" className="home-logo" />
      </Link>
    
    </nav>
  );
};

export default Nav;