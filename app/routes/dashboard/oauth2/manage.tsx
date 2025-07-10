import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, RefreshCw, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
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

const AVAILABLE_SCOPES = [
  { id: 'openid', label: 'OpenID Connect', description: 'Basic user identification' },
  { id: 'profile', label: 'Profile', description: 'User profile information' },
  { id: 'email', label: 'Email', description: 'User email address' },
  { id: 'offline_access', label: 'Offline Access', description: 'Refresh token access' },
];

interface OAuthApp {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export default function OAuth2Manage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<OAuthApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    redirectUris: [''],
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (clientId) {
      loadApp();
    }
  }, [clientId]);

  const loadApp = async () => {
    try {
      setLoading(true);
      const session = await authClient.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/auth/admin/get-oidc-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use session cookies
        body: JSON.stringify({ clientId }),
      });

      if (response.ok) {
        const data = await response.json() as OAuthApp;
        setApp(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          redirectUris: data.redirectUris,
          scopes: data.scopes,
        });
      } else {
        throw new Error('Failed to load application');
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      toast.error("Failed to load application details", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      navigate('/oauth2');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRedirectUriChange = (index: number, value: string) => {
    const newUris = [...formData.redirectUris];
    newUris[index] = value;
    setFormData(prev => ({
      ...prev,
      redirectUris: newUris
    }));
  };

  const addRedirectUri = () => {
    setFormData(prev => ({
      ...prev,
      redirectUris: [...prev.redirectUris, '']
    }));
  };

  const removeRedirectUri = (index: number) => {
    if (formData.redirectUris.length > 1) {
      const newUris = formData.redirectUris.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        redirectUris: newUris
      }));
    }
  };

  const handleScopeChange = (scopeId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        scopes: [...prev.scopes, scopeId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        scopes: prev.scopes.filter(s => s !== scopeId)
      }));
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied", {
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast.error("Failed to copy to clipboard", {
        description: "Unable to access clipboard",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Application name is required", {
        description: "Please enter a valid application name",
      });
      return;
    }

    if (formData.redirectUris.some(uri => !uri.trim())) {
      toast.error("All redirect URIs must be filled in", {
        description: "Please ensure all redirect URI fields contain valid URLs",
      });
      return;
    }

    setSaving(true);
    try {
      const session = await authClient.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/auth/admin/update-oidc-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use session cookies
        body: JSON.stringify({
          clientId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          redirectUris: formData.redirectUris.map(uri => uri.trim()),
          scopes: formData.scopes,
        }),
      });

      if (response.ok) {
        toast.success("Application updated successfully", {
          description: "Your changes have been saved",
        });
        loadApp();
      } else {
        throw new Error('Failed to update application');
      }
    } catch (error) {
      toast.error("Failed to update application", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  const regenerateSecret = async () => {
    try {
      const session = await authClient.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/auth/admin/regenerate-oidc-secret`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use session cookies
        body: JSON.stringify({ clientId }),
      });

      if (response.ok) {
        toast.success("Client secret regenerated successfully", {
          description: "Please update your application with the new secret",
        });
        loadApp();
      } else {
        throw new Error('Failed to regenerate secret');
      }
    } catch (error) {
      toast.error("Failed to regenerate client secret", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          <div>
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-4xl">
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Application not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested OAuth2 application could not be found.
        </p>
        <Button className="mt-4" onClick={() => navigate('/oauth2')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/oauth2')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{app.name}</h1>
          <p className="text-muted-foreground">
            Manage OAuth2 application settings and credentials
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Update your application's basic information and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Redirect URIs</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Valid OAuth2 redirect URIs for your application
                    </p>
                  </div>

                  {formData.redirectUris.map((uri, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={uri}
                        onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                        placeholder="https://myapp.com/auth/callback"
                      />
                      {formData.redirectUris.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRedirectUri(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRedirectUri}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Redirect URI
                  </Button>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Credentials</CardTitle>
                <CardDescription>
                  Your application's OAuth2 client credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <div className="flex gap-2">
                    <Input value={app.clientId} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(app.clientId, 'Client ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecret ? "text" : "password"}
                      value={app.clientSecret}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(app.clientSecret, 'Client Secret')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate Client Secret
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Client Secret</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will generate a new client secret and invalidate the current one.
                          Make sure to update your application with the new secret.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={regenerateSecret}>
                          Regenerate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>OAuth2 Scopes</CardTitle>
                <CardDescription>
                  Manage the permissions your application can request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div key={scope.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={scope.id}
                        checked={formData.scopes.includes(scope.id)}
                        onCheckedChange={(checked) =>
                          handleScopeChange(scope.id, checked as boolean)
                        }
                      />
                      <div className="space-y-1 leading-none">
                        <Label
                          htmlFor={scope.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {scope.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {scope.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Current Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary">
                        {AVAILABLE_SCOPES.find(s => s.id === scope)?.label || scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
