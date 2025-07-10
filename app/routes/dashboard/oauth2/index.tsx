import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Settings, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Skeleton } from '~/components/ui/skeleton';

interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OAuth2Index() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      // Using authClient to fetch OAuth applications
      const session = await authClient.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/auth/admin/list-oidc-clients', {
        credentials: 'include', // Use session cookies
      });

      if (response.ok) {
        const data = await response.json() as { clients?: OAuthApp[] };
        setApps(data.clients || []);
      }
    } catch (error) {
      console.error('Failed to load OAuth applications:', error);
      toast("Failed to load OAuth applications", {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`, {
        description: text,
      });
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const deleteApp = async (appId: string) => {
    try {
      const session = await authClient.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/auth/admin/revoke-oidc-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use session cookies
        body: JSON.stringify({ clientId: appId }),
      });

      if (response.ok) {
        toast.success("Application deleted successfully");
        loadApps();
      } else {
        throw new Error('Failed to delete application');
      }
    } catch (error) {
      toast.error("Failed to delete application", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const toggleSecretVisibility = (appId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-col sm:flex-row">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-start sm:items-center sm:justify-between flex-col sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold">OAuth2 Applications</h1>
          <p className="text-muted-foreground">
            Manage your OAuth2 applications and client credentials
          </p>
        </div>
        <Button asChild>
          <Link to="/oauth2/register">
            <Plus className="mr-2 h-4 w-4" />
            Register Application
          </Link>
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No applications yet</h3>
                <p className="text-muted-foreground">
                  Get started by registering your first OAuth2 application
                </p>
              </div>
              <Button asChild>
                <Link to="/oauth2/register">
                  Register Your First Application
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Created {new Date(app.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">CLIENT ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={app.clientId}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(app.clientId, 'Client ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">CLIENT SECRET</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type={showSecrets[app.id] ? "text" : "password"}
                        value={app.clientSecret}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSecretVisibility(app.id)}
                      >
                        {showSecrets[app.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(app.clientSecret, 'Client Secret')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">REDIRECT URIS</Label>
                    <div className="mt-1 space-y-1">
                      {app.redirectUris.map((uri, index) => (
                        <div key={index} className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {uri}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">SCOPES</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.scopes.map((scope, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link to={`/oauth2/manage/${app.id}`}>
                      <Settings className="mr-2 h-3 w-3" />
                      Manage
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Application</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{app.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteApp(app.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
