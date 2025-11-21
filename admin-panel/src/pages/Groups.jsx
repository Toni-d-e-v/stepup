import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { groupAPI } from '../services/api';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newGroup, setNewGroup] = useState({
    name: '',
    type: 'custom',
    description: '',
  });

  const [generateConfig, setGenerateConfig] = useState({
    type: 'class',
    prefix: 'Class',
    start: 1,
    end: 10,
    name: '',
    role: 'student',
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await groupAPI.getAll();
      setGroups(response.data.groups);
    } catch (error) {
      setError('Error loading groups');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await groupAPI.create(newGroup);
      setSuccess('Group created successfully');
      setCreateDialog(false);
      setNewGroup({ name: '', type: 'custom', description: '' });
      loadGroups();
    } catch (error) {
      setError('Error creating group');
    }
  };

  const handleGenerateGroups = async () => {
    try {
      let pattern;

      if (generateConfig.type === 'class') {
        pattern = {
          prefix: generateConfig.prefix,
          start: parseInt(generateConfig.start),
          end: parseInt(generateConfig.end),
        };
      } else if (generateConfig.type === 'generation') {
        pattern = {
          name: generateConfig.name,
          role: generateConfig.role,
        };
      } else if (generateConfig.type === 'all_students' || generateConfig.type === 'all_professors') {
        pattern = {};
      }

      await groupAPI.generate({
        type: generateConfig.type,
        pattern,
      });

      setSuccess(`Groups generated successfully`);
      setGenerateDialog(false);
      loadGroups();
    } catch (error) {
      setError('Error generating groups');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupAPI.delete(groupId);
        setSuccess('Group deleted successfully');
        loadGroups();
      } catch (error) {
        setError('Error deleting group');
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      class: 'primary',
      generation: 'secondary',
      all_students: 'success',
      all_professors: 'warning',
      custom: 'default',
    };
    return colors[type] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Group Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setGenerateDialog(true)}
          >
            Generate Groups
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create Group
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadGroups}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div">
                      {group.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={group.type.replace('_', ' ')}
                    size="small"
                    color={getTypeColor(group.type)}
                    sx={{ mb: 1 }}
                  />
                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Members: <strong>{group.members?.length || 0}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Steps: <strong>{group.totalSteps.toLocaleString()}</strong>
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="error" onClick={() => handleDeleteGroup(group._id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newGroup.type}
                label="Type"
                onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
              >
                <MenuItem value="class">Class</MenuItem>
                <MenuItem value="generation">Generation</MenuItem>
                <MenuItem value="all_students">All Students</MenuItem>
                <MenuItem value="all_professors">All Professors</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Generate Groups Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Groups Automatically</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Generation Type</InputLabel>
              <Select
                value={generateConfig.type}
                label="Generation Type"
                onChange={(e) => setGenerateConfig({ ...generateConfig, type: e.target.value })}
              >
                <MenuItem value="class">Multiple Classes (e.g., Class 1, Class 2...)</MenuItem>
                <MenuItem value="generation">Generation Group (all students/professors)</MenuItem>
                <MenuItem value="all_students">All Students Group</MenuItem>
                <MenuItem value="all_professors">All Professors Group</MenuItem>
              </Select>
            </FormControl>

            {generateConfig.type === 'class' && (
              <>
                <TextField
                  label="Prefix"
                  value={generateConfig.prefix}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, prefix: e.target.value })}
                  fullWidth
                  helperText="e.g., 'Class', 'Group', 'Section'"
                />
                <TextField
                  label="Start Number"
                  type="number"
                  value={generateConfig.start}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, start: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="End Number"
                  type="number"
                  value={generateConfig.end}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, end: e.target.value })}
                  fullWidth
                />
                <Alert severity="info">
                  This will create {Math.max(0, parseInt(generateConfig.end) - parseInt(generateConfig.start) + 1)} groups
                </Alert>
              </>
            )}

            {generateConfig.type === 'generation' && (
              <>
                <TextField
                  label="Generation Name"
                  value={generateConfig.name}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, name: e.target.value })}
                  fullWidth
                  helperText="e.g., 'Generation 2024', 'Freshmen 2024'"
                />
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={generateConfig.role}
                    label="Role"
                    onChange={(e) => setGenerateConfig({ ...generateConfig, role: e.target.value })}
                  >
                    <MenuItem value="student">Students</MenuItem>
                    <MenuItem value="professor">Professors</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {(generateConfig.type === 'all_students' || generateConfig.type === 'all_professors') && (
              <Alert severity="info">
                This will create a group containing all {generateConfig.type === 'all_students' ? 'students' : 'professors'}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateGroups} variant="contained" startIcon={<AutoAwesomeIcon />}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
