import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Schools() {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
  });
  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/schools`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch schools');

      const data = await response.json();

      // Fetch details for each school to get schoolAdmins
      const schoolsWithAdmins = await Promise.all(
        data.map(async (school) => {
          try {
            const detailResponse = await fetch(`${API_URL}/schools/${school._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (detailResponse.ok) {
              return await detailResponse.json();
            }
            return school;
          } catch {
            return school;
          }
        })
      );

      setSchools(schoolsWithAdmins);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setFormData({
        name: school.name,
        address: school.address || '',
        city: school.city || '',
        country: school.country || '',
      });
    } else {
      setEditingSchool(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        country: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchool(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
    });
  };

  const handleOpenAdminDialog = (school) => {
    setSelectedSchool(school);
    setAdminFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });
    setOpenAdminDialog(true);
  };

  const handleCloseAdminDialog = () => {
    setOpenAdminDialog(false);
    setSelectedSchool(null);
    setAdminFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingSchool
        ? `${API_URL}/schools/${editingSchool._id}`
        : `${API_URL}/schools`;

      const response = await fetch(url, {
        method: editingSchool ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save school');
      }

      setSuccess(editingSchool ? 'School updated successfully' : 'School created successfully');
      handleCloseDialog();
      fetchSchools();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSchoolAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/schools/${selectedSchool._id}/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminFormData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create school admin');
      }

      setSuccess('School admin created successfully');
      handleCloseAdminDialog();
      fetchSchools();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveSchoolAdmin = async (schoolId, adminId) => {
    if (!window.confirm('Are you sure you want to remove this school admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/schools/${schoolId}/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove school admin');
      }

      setSuccess('School admin removed successfully');
      fetchSchools();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm('Are you sure you want to deactivate this school?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/schools/${schoolId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete school');
      }

      setSuccess('School deactivated successfully');
      fetchSchools();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpand = (schoolId) => {
    setExpandedSchool(expandedSchool === schoolId ? null : schoolId);
  };

  if (user?.role !== 'superAdmin') {
    return (
      <Box>
        <Alert severity="error">Access denied. Super admin only.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Schools Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add School
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Admins</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map((school) => (
                <React.Fragment key={school._id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(school._id)}
                      >
                        {expandedSchool === school._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500">
                        {school.name}
                      </Typography>
                      {school.address && (
                        <Typography variant="body2" color="text.secondary">
                          {school.address}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{school.city || '-'}</TableCell>
                    <TableCell>{school.country || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${school.schoolAdmins?.length || 0} admin(s)`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={school.active ? 'Active' : 'Inactive'}
                        color={school.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenAdminDialog(school)}
                        color="success"
                        title="Add School Admin"
                      >
                        <PersonAddIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(school)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(school._id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={expandedSchool === school._id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            School Admins
                          </Typography>
                          {school.schoolAdmins && school.schoolAdmins.length > 0 ? (
                            <List>
                              {school.schoolAdmins.map((admin) => (
                                <ListItem key={admin._id}>
                                  <ListItemText
                                    primary={`${admin.firstName} ${admin.lastName}`}
                                    secondary={admin.email}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleRemoveSchoolAdmin(school._id, admin._id)}
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No school admins assigned yet.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No schools found. Create your first school to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* School Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="School Name"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <TextField
                label="City"
                fullWidth
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <TextField
                label="Country"
                fullWidth
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingSchool ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* School Admin Dialog */}
      <Dialog open={openAdminDialog} onClose={handleCloseAdminDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSchoolAdmin}>
          <DialogTitle>Create School Admin for {selectedSchool?.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={adminFormData.firstName}
                onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                value={adminFormData.lastName}
                onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                helperText="Minimum 6 characters"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAdminDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create Admin
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
