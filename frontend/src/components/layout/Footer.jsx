//import logo from "../assets/images/mycare-logo.png";

function Footer() {
  return (
    <footer className="mycare-footer">
      <div className="container">
        <div className="mycare-footer-content">
          <div>
            <div className="mycare-footer-brand">
             <img
                src="/images/mycare-logo-transparent.png"
                alt="MyCare Logo"
                className="mycare-logo"
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