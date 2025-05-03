import React from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/presentation/atoms'; // Use index
import { Badge } from '@/presentation/atoms'; // Use index
import { Label } from '@/presentation/atoms';
import MainLayout from '@/presentation/templates/MainLayout';
import Header from '@/presentation/molecules/Header';
import { DocumentTitle } from '@/presentation/atoms';
import type { User as DomainUser } from '@domain/types/auth/auth'; // Import domain User

/**
 * @description Renders the user profile page, displaying details of the logged-in user.
 *              Fetches user data from the AuthContext.
 * @returns {React.ReactElement} The rendered profile page component.
 */
const ProfilePage: React.FC = (): React.ReactElement => {
  const { user } = useAuth();

  if (!user) {
    return <div>User data not available.</div>;
  }

  return (
    <>
      <DocumentTitle title="Profile | Clarity-AI Digital Twin" />
      <MainLayout>
        <Header title="User Profile" subtitle="View and manage your account settings" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-lg">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-lg">N/A</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </>
  );
};

export default ProfilePage;
