import React from 'react';
import { useAuth } from '@/application/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/atoms';

/**
 * @description Renders the user profile page, displaying details of the logged-in user.
 *              Fetches user data from the AuthContext.
 * @returns {React.ReactElement} The rendered profile page component.
 */
const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {/* Add other user details from the DomainUser type as needed */}
          {/* <p><strong>Name:</strong> {user.name || 'N/A'}</p> */}
          {/* <p><strong>Role:</strong> {user.role}</p> */}
          {/* <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p> */}
        </CardContent>
      </Card>
      <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;
