function App() {
    const { Form, Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const { Form, Button, Input } = ReactBootstrap;
    const [isLoading, setLoading] = React.useState(true);
    const [items, setItems] = React.useState(null);
    const [accessToken, setAccessToken] = React.useState('');
    const [refreshToken, setRefreshToken] = React.useState('');
    const [expiresInt, setExpiresInt] = React.useState(0);

    React.useEffect(() => {
        fetch('/admin')
            .then(r => r.json())
            .then((items) => {
                setItems(items);
                if (items) {
                    setAccessToken(items.access_token);
                    setRefreshToken(items.refresh_token);
                }
                setLoading(false);
            });
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const addData = React.useCallback((ev) => {
        ev.preventDefault();
        fetch('/admin/set-token', {
            method: 'POST',
            body: JSON.stringify({ accessToken, refreshToken }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(console.log)
            .catch(console.log);
    }, [accessToken, refreshToken]);

    const onChangeAccessToken = React.useCallback((ev) => setAccessToken(ev.target.value), []);
    const onChangeRefreshToken = React.useCallback((ev) => setRefreshToken(ev.target.value), []);
    const onChangeExpiresInt = React.useCallback((ev) => setExpiresInt(ev.target.value), []);

    if (isLoading) return 'Loading ...'

    return (
        <Form onSubmit={addData}>
            <label htmlFor="access-token-input">Access Token:</label>
            <Form.Control
                id="access-token-input"
                value={accessToken}
                type="string"
                onChange={onChangeAccessToken}
            />
            <label htmlFor="refresh-token-input">Refresh Token:</label>
            <Form.Control
                id="refresh-token-input"
                value={refreshToken}
                onChange={onChangeRefreshToken}
                type="string"
            />
            <label htmlFor="expires-input">Expires:</label>
            <Form.Control
                id="expires-input"
                value={expiresInt}
                onChange={onChangeExpiresInt}
                type="number"
                min={0}
            />
            <Button type="submit">Submit</Button>
        </Form>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add Item'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
