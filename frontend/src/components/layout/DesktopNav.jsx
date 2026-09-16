const DesktopNav = ({ currentTab, onTabChange }) => {
  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings', 'Help & Support'];

  return (
    /* 
       flex-grow-1: Makes the nav take up all remaining horizontal space.
       justify-content-center: Perfectly centers all the menu items.
       d-none d-md-flex: Visible on 768px and above.
       gap-4: Adds perfect space between each menu item.
    */
    <nav className="d-none d-md-flex flex-grow-1 align-items-center justify-content-center gap-4 px-4 py-3 bg-white border-bottom">
      {navItems.map((item) => (
        <button
          key={item}
          className={`btn border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-secondary'}`}
          style={{ fontSize: '14px', cursor: 'pointer' }}
          onClick={() => onTabChange(item)}
        >
          {item}
        </button>
      ))}
    </nav>
  );
};

export default DesktopNav;