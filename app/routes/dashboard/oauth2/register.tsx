import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Copy, Download } from 'lucide-react';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { toast } from 'sonner';

const AVAILABLE_SCOPES = [
  { id: 'openid', label: 'OpenID Connect', description: 'Basic user identification' },
  { id: 'profile', label: 'Profile', description: 'User profile information' },
  { id: 'email', label: 'Email', description: 'User email address' },
  { id: 'offline_access', label: 'Offline Access', description: 'Refresh token access' },
];

const formSchema = z.object({
  name: z.string().min(1, 'Application name is required'),
  description: z.string().optional(),
  redirectUris: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one redirect URI is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope must be selected'),
  client_uri: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
  contacts: z.array(z.string()).optional().refine((arr) => !arr || arr.every(email => !email || z.string().email().safeParse(email).success), {
    message: 'All contacts must be valid email addresses',
  }),
  policy_uri: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
  tos_uri: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function OAuth2Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    client_id: string;
    client_secret: string;
    client_name: string;
    description?: string;
    client_uri?: string;
    policy_uri?: string;
    tos_uri?: string;
    contacts?: string[];
    redirect_uris: string[];
    scopes: string[];
    owner: string;
    created_at: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      redirectUris: [''],
      scopes: ['openid', 'profile', 'email'],
      client_uri: '',
      contacts: [''],
      policy_uri: '',
      tos_uri: '',
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedRedirectUris = watch('redirectUris');
  const watchedScopes = watch('scopes');
  const watchedContacts = watch('contacts');

  const handleRedirectUriChange = (index: number, value: string) => {
    const currentUris = getValues('redirectUris');
    const newUris = [...currentUris];
    newUris[index] = value;
    setValue('redirectUris', newUris);
  };

  const addRedirectUri = () => {
    const currentUris = getValues('redirectUris');
    setValue('redirectUris', [...currentUris, '']);
  };

  const removeRedirectUri = (index: number) => {
    const currentUris = getValues('redirectUris');
    if (currentUris.length > 1) {
      const newUris = currentUris.filter((_, i) => i !== index);
      setValue('redirectUris', newUris);
    }
  };

  const handleContactChange = (index: number, value: string) => {
    const currentContacts = getValues('contacts') || [];
    const newContacts = [...currentContacts];
    newContacts[index] = value;
    setValue('contacts', newContacts);
  };

  const addContact = () => {
    const currentContacts = getValues('contacts') || [];
    setValue('contacts', [...currentContacts, '']);
  };

  const removeContact = (index: number) => {
    const currentContacts = getValues('contacts') || [];
    if (currentContacts.length > 1) {
      const newContacts = currentContacts.filter((_, i) => i !== index);
      setValue('contacts', newContacts);
    }
  };

  const handleScopeChange = (scopeId: string, checked: boolean) => {
    const currentScopes = getValues('scopes');
    if (checked) {
      setValue('scopes', [...currentScopes, scopeId]);
    } else {
      setValue('scopes', currentScopes.filter(s => s !== scopeId));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { data: session, error: sessionError } = await authClient.getSession();
    if (!session || sessionError) {
      toast.error('You must be logged in to register an application');
      setLoading(false);
      return;
    }

    const result = await authClient.oauth2.register({
      client_name: data.name.trim(),
      client_uri: data.client_uri?.trim() || undefined,
      contacts: data.contacts?.filter(contact => contact.trim()).map(contact => contact.trim()) || undefined,
      policy_uri: data.policy_uri?.trim() || undefined,
      tos_uri: data.tos_uri?.trim() || undefined,
      metadata: {
        description: data.description?.trim() || '',
        redirect_uris: data.redirectUris.map(uri => uri.trim()),
        scopes: data.scopes,
      },
      redirect_uris: data.redirectUris.map(uri => uri.trim()),
      scope: data.scopes.join(' '),
    });

    if (result.error) {
      toast.error(`Failed to register application: ${result.error.message}`);
      setLoading(false);
      return;
    }

    // Store the result data and show success modal
    setRegistrationResult({
      client_id: result.data?.client_id || '',
      client_secret: result.data?.client_secret || '',
      client_name: data.name.trim(),
      description: data.description?.trim() || undefined,
      client_uri: data.client_uri?.trim() || undefined,
      policy_uri: data.policy_uri?.trim() || undefined,
      tos_uri: data.tos_uri?.trim() || undefined,
      contacts: data.contacts?.filter(contact => contact.trim()) || undefined,
      redirect_uris: data.redirectUris.map(uri => uri.trim()),
      scopes: data.scopes,
      owner: session.user.email || session.user.name || 'Unknown',
      created_at: new Date().toISOString(),
    });
    setShowSuccessModal(true);
    toast.success('Application registered successfully');
    setLoading(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const downloadYamlConfig = () => {
    if (!registrationResult) return;

    const yamlContent = `# OAuth2 Application Configuration
# Generated on: ${new Date(registrationResult.created_at).toLocaleString()}

oauth2_application:
  # Application Information
  client_name: "${registrationResult.client_name}"
  ${registrationResult.description ? `description: "${registrationResult.description}"` : '# description: ""'}
  owner: "${registrationResult.owner}"
  created_at: "${registrationResult.created_at}"
  
  # Client Credentials
  client_id: "${registrationResult.client_id}"
  client_secret: "${registrationResult.client_secret}"
  
  # Application URLs
  ${registrationResult.client_uri ? `client_uri: "${registrationResult.client_uri}"` : '# client_uri: ""'}
  ${registrationResult.policy_uri ? `policy_uri: "${registrationResult.policy_uri}"` : '# policy_uri: ""'}
  ${registrationResult.tos_uri ? `tos_uri: "${registrationResult.tos_uri}"` : '# tos_uri: ""'}
  
  # Redirect URIs
  redirect_uris:
${registrationResult.redirect_uris.map(uri => `    - "${uri}"`).join('\n')}
  
  # OAuth2 Scopes
  scopes:
${registrationResult.scopes.map(scope => `    - "${scope}"`).join('\n')}
  
  ${registrationResult.contacts && registrationResult.contacts.length > 0 ? `# Contact Information
  contacts:
${registrationResult.contacts.map(contact => `    - "${contact}"`).join('\n')}` : '# contacts: []'}

# IMPORTANT: Store these credentials securely
# The client_secret will not be shown again after this download
`;

    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oauth2-${registrationResult.client_name.toLowerCase().replace(/\s+/g, '-')}-config.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Configuration downloaded successfully');
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setRegistrationResult(null);
    navigate('/oauth2');
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate('/oauth2')}>
        <ArrowLeft className="size-4" />
        Back to Applications
      </Button>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Register OAuth2 Application</h1>
          <p className="text-muted-foreground">
            Create a new OAuth2 application to enable third-party integrations
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Configure your OAuth2 application settings and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="My Application" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name for your application that users will see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of your application..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Redirect URIs *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Valid OAuth2 redirect URIs for your application
                  </p>
                </div>

                {watchedRedirectUris.map((uri, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={uri}
                      onChange={(e) => handleRedirectUriChange(index, e.target.value)}
                      placeholder="https://myapp.com/auth/callback"
                    />
                    {watchedRedirectUris.length > 1 && (
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

                {form.formState.errors.redirectUris && (
                  <p className="text-sm text-destructive">{form.formState.errors.redirectUris.message}</p>
                )}

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

              <FormField
                control={form.control}
                name="client_uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client URI</FormLabel>
                    <FormControl>
                      <Input placeholder="https://myapp.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL of the home page of your application
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Contact Emails</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Email addresses for support and contact regarding this application
                  </p>
                </div>

                {watchedContacts?.map((contact, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={contact}
                      onChange={(e) => handleContactChange(index, e.target.value)}
                      placeholder="support@myapp.com"
                      type="email"
                    />
                    {(watchedContacts?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {form.formState.errors.contacts && (
                  <p className="text-sm text-destructive">{form.formState.errors.contacts.message}</p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact Email
                </Button>
              </div>

              <FormField
                control={form.control}
                name="policy_uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Policy URI</FormLabel>
                    <FormControl>
                      <Input placeholder="https://myapp.com/privacy" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to your application's privacy policy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tos_uri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms of Service URI</FormLabel>
                    <FormControl>
                      <Input placeholder="https://myapp.com/terms" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to your application's terms of service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Scopes *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select the permissions your application will request
                  </p>
                </div>

                <div className="grid gap-4">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div key={scope.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={scope.id}
                        checked={watchedScopes.includes(scope.id)}
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

                {form.formState.errors.scopes && (
                  <p className="text-sm text-destructive">{form.formState.errors.scopes.message}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {watchedScopes.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      {AVAILABLE_SCOPES.find(s => s.id === scope)?.label || scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" disabled={loading || !form.formState.isValid}>
                  {loading ? "Registering..." : "Register Application"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/oauth2')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Registered Successfully!</DialogTitle>
            <DialogDescription>
              Your OAuth2 application has been created. Please save these credentials securely as they will not be shown again.
            </DialogDescription>
          </DialogHeader>

          {registrationResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Client ID</Label>
                <div className="flex gap-2">
                  <Input
                    value={registrationResult.client_id}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(registrationResult.client_id, 'Client ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex gap-2">
                  <Input
                    value={registrationResult.client_secret}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(registrationResult.client_secret, 'Client Secret')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Store these credentials securely. The client secret will not be displayed again after you close this dialog.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Download the YAML configuration file to save all application details including credentials for your records.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleModalClose}>
                  Continue to Applications
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadYamlConfig}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download YAML Config
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
