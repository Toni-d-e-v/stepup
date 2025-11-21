import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { challengeAPI } from '../services/api';
import { format } from 'date-fns';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'weekly',
    targetSteps: 70000,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    rewardPoints: 100,
    rewardBadge: '',
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const response = await challengeAPI.getAll();
      setChallenges(response.data.challenges);
    } catch (error) {
      setError('Error loading challenges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      await challengeAPI.create(newChallenge);
      setSuccess('Challenge created successfully');
      setCreateDialog(false);
      setNewChallenge({
        title: '',
        description: '',
        type: 'weekly',
        targetSteps: 70000,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        rewardPoints: 100,
        rewardBadge: '',
      });
      loadChallenges();
    } catch (error) {
      setError('Error creating challenge');
    }
  };

  const handleUpdateProgress = async (challengeId) => {
    try {
      await challengeAPI.updateProgress(challengeId);
      setSuccess('Challenge progress updated');
      loadChallenges();
    } catch (error) {
      setError('Error updating challenge progress');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await challengeAPI.delete(challengeId);
        setSuccess('Challenge deleted successfully');
        loadChallenges();
      } catch (error) {
        setError('Error deleting challenge');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'info',
      active: 'success',
      completed: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Challenge Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create Challenge
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadChallenges}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Target Steps</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="right">Participants</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {challenges.map((challenge) => (
                <TableRow key={challenge._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {challenge.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {challenge.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={challenge.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={challenge.status}
                      size="small"
                      color={getStatusColor(challenge.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {challenge.targetSteps.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(challenge.startDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell align="right">
                    {challenge.participants?.length || 0}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateProgress(challenge._id)}
                      color="primary"
                      title="Update Progress"
                    >
                      <TrendingUpIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteChallenge(challenge._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Create Challenge Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Challenge</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Title"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newChallenge.type}
                label="Type"
                onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target Steps"
              type="number"
              value={newChallenge.targetSteps}
              onChange={(e) => setNewChallenge({ ...newChallenge, targetSteps: parseInt(e.target.value) })}
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Start Date"
                type="date"
                value={newChallenge.startDate}
                onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={newChallenge.endDate}
                onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Reward Points"
              type="number"
              value={newChallenge.rewardPoints}
              onChange={(e) => setNewChallenge({ ...newChallenge, rewardPoints: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Reward Badge (Emoji)"
              value={newChallenge.rewardBadge}
              onChange={(e) => setNewChallenge({ ...newChallenge, rewardBadge: e.target.value })}
              fullWidth
              placeholder="🏆"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateChallenge} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
