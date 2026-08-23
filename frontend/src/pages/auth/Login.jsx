import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">

          <div className="mycare-card p-4">

            <p className="mycare-eyebrow">
              WELCOME BACK
            </p>

            <h1 className="h3">
              Sign in to MY CARE
            </h1>

            <p className="mycare-muted">
              Access your medications, symptoms and health history.
            </p>

            <div className="mb-3">
              <label className="form-label">
                Phone or Email
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter phone or email"
              />
            </div>

            <button className="btn btn-primary w-100">
              Continue
            </button>

            <div className="text-center mt-3">
              <Link to="/signup">
                Create an account
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Login;