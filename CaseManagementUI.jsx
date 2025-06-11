// CasesUI.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Badge, 
  Container, Row, Col, Card, Spinner 
} from 'react-bootstrap';
import axios from 'axios';
import { format } from 'date-fns';

const CasesUI = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    violation_types: [],
    status: 'NEW',
    priority: 'MEDIUM',
    location: {
      country: '',
      region: '',
      city: ''
    },
    date_occurred: '',
    perpetrators: []
  });

  // Status colors
  const statusColors = {
    NEW: 'primary',
    UNDER_INVESTIGATION: 'info',
    PENDING: 'warning',
    CLOSED: 'secondary',
    RESOLVED: 'success'
  };

  // Priority colors
  const priorityColors = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'danger',
    URGENT: 'dark'
  };

  // Fetch cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/cases');
        setCases(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load cases. Please try again later.');
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle violation types input
  const handleViolationTypes = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      violation_types: value.split(',').map(type => type.trim())
    });
  };

  // Submit new case
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/cases', formData);
      setCases([...cases, response.data]);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        violation_types: [],
        status: 'NEW',
        priority: 'MEDIUM',
        location: {
          country: '',
          region: '',
          city: ''
        },
        date_occurred: '',
        perpetrators: []
      });
    } catch (err) {
      setError('Failed to create case. Please try again.');
      console.error('Error creating case:', err);
    } finally {
      setLoading(false);
    }
  };

  // View case details
  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowViewModal(true);
  };

  // Render loading spinner
  if (loading && cases.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Render error message
  if (error && cases.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Case Management</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add New Case
          </Button>
        </Col>
      </Row>

      {/* Cases Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date Reported</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem._id}>
                  <td>{caseItem.case_number || caseItem._id}</td>
                  <td>{caseItem.title}</td>
                  <td>
                    <Badge bg={statusColors[caseItem.status] || 'secondary'}>
                      {caseItem.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={priorityColors[caseItem.priority] || 'secondary'}>
                      {caseItem.priority}
                    </Badge>
                  </td>
                  <td>{format(new Date(caseItem.date_reported), 'MMM dd, yyyy')}</td>
                  <td>
                    {`${caseItem.location.city || ''}, ${caseItem.location.country}`}
                  </td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      onClick={() => handleViewCase(caseItem)}
                      className="me-2"
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      href={`/cases/${caseItem._id}/edit`}
                      className="me-2"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No cases found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Case Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Violation Types (comma separated)</Form.Label>
                  <Form.Control 
                    type="text" 
                    onChange={handleViolationTypes}
                    placeholder="assault, hate_crime, discrimination"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="NEW">New</option>
                    <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Region</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="location.region"
                    value={formData.location.region}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Date Occurred</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="date_occurred"
                value={formData.date_occurred}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Case'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Case Modal */}
      {selectedCase && (
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Case Details: {selectedCase.case_number || selectedCase._id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0">Basic Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Title:</strong> {selectedCase.title}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <Badge bg={statusColors[selectedCase.status] || 'secondary'}>
                        {selectedCase.status.replace('_', ' ')}
                      </Badge>
                    </p>
                    <p>
                      <strong>Priority:</strong>{' '}
                      <Badge bg={priorityColors[selectedCase.priority] || 'secondary'}>
                        {selectedCase.priority}
                      </Badge>
                    </p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Date Reported:</strong> {format(new Date(selectedCase.date_reported), 'MMM dd, yyyy')}</p>
                    <p><strong>Date Occurred:</strong> {format(new Date(selectedCase.date_occurred), 'MMM dd, yyyy')}</p>
                    <p><strong>Location:</strong> {`${selectedCase.location.city || ''}, ${selectedCase.location.region || ''}, ${selectedCase.location.country}`}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0">Violation Details</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Violation Types:</strong></p>
                <div>
                  {selectedCase.violation_types.map((type, index) => (
                    <Badge key={index} bg="info" className="me-2 mb-2">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3"><strong>Description:</strong></p>
                <p>{selectedCase.description}</p>
              </Card.Body>
            </Card>

            {selectedCase.perpetrators && selectedCase.perpetrators.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">Perpetrators</h5>
                </Card.Header>
                <Card.Body>
                  {selectedCase.perpetrators.map((perp, index) => (
                    <div key={index} className="mb-3">
                      <p><strong>Name:</strong> {perp.name}</p>
                      <p><strong>Type:</strong> {perp.type}</p>
                      {perp.description && <p><strong>Description:</strong> {perp.description}</p>}
                      <hr />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            {selectedCase.evidence && selectedCase.evidence.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">Evidence</h5>
                </Card.Header>
                <Card.Body>
                  {selectedCase.evidence.map((item, index) => (
                    <div key={index} className="mb-3">
                      <p><strong>Type:</strong> {item.type}</p>
                      <p><strong>Description:</strong> {item.description || 'No description'}</p>
                      <p>
                        <strong>Link:</strong>{' '}
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          View Evidence
                        </a>
                      </p>
                      <hr />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}

            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowViewModal(false)} 
                className="me-2"
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                href={`/cases/${selectedCase._id}/edit`}
              >
                Edit Case
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default CasesUI;