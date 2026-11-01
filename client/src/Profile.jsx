function Profile() {
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole");

  return (
    <div style={{ padding: "40px" }}>
      <h1>My Profile</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "25px",
          borderRadius: "10px",
          maxWidth: "500px"
        }}
      >
        <h2>Volunteer Information</h2>

        <p>
          <strong>Name:</strong> {name || "N/A"}
        </p>

        <p>
          <strong>Email:</strong> {email || "N/A"}
        </p>

        <p>
          <strong>Role:</strong> {role || "Volunteer"}
        </p>
      </div>
    </div>
  );
}

export default Profile;