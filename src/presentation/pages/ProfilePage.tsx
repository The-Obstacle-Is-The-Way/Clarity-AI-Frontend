import React from 'react';
import { useAuth } from '@application/hooks/useAuth'; // Adjust path as necessary
import { Card, CardContent, CardHeader, CardTitle } from '@presentation/atoms/Card'; // Correct casing
import { Badge } from '@presentation/atoms/Badge'; // Correct casing

/**
 * @description Renders the user profile page, displaying details of the logged-in user.
 *              Fetches user data from the AuthContext.
 * @returns {React.ReactElement} The rendered profile page component.
 */
const ProfilePage: React.FC = (): React.ReactElement => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Consider using a dedicated LoadingSpinner component
    return <div className="p-4">Loading profile...</div>;
  }

  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but added for robustness
    return <div className="p-4 text-red-500">Error: User data not found. Please log in again.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
            <p className="text-lg">{user.email}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</span>
            <p className="text-lg">{user.first_name || 'N/A'}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</span>
            <p className="text-lg">{user.last_name || 'N/A'}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">No roles assigned</span>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
            <Badge variant={user.is_active ? 'default' : 'destructive'}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {/* Add more user details as needed */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
