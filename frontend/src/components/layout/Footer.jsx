//import logo from "../assets/images/mycare-logo.png";

function Footer() {
  return (
    <footer className="mycare-footer">
      <div className="container">
        <div className="mycare-footer-content">
          <div>
            <div className="mycare-footer-brand">
              <img 
                src="/frontend/public/images/mycare-logo.png"
                alt="MyCare Logo" 
                className="mycare-footer-logo-img" 
              />
            </div>

            <p className="mycare-footer-text">
              Helping you stay informed,
              consistent, and in control of
              your health routine.
            </p>
          </div>

          <div className="mycare-footer-links">
            <a href="#">Privacy</a>
            <a href="#">About</a>
            <a href="#">Support</a>
          </div>
        </div>

        <div className="mycare-footer-bottom">
          © 2026 MyCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;