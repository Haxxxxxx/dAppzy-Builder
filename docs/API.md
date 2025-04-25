# API Documentation

## Token Management

### TokenManager

The `TokenManager` class provides secure token management functionality.

#### Methods

##### setToken(type, token)
```javascript
TokenManager.setToken('AUTH', 'your-token');
```
Sets a token of the specified type.

**Parameters:**
- `type` (string): Token type (AUTH, WEB3, PINATA, FIREBASE)
- `token` (string): The token value

##### getToken(type)
```javascript
const token = TokenManager.getToken('AUTH');
```
Retrieves a token of the specified type.

**Parameters:**
- `type` (string): Token type

**Returns:**
- `string|null`: The token value or null if not found

##### removeToken(type)
```javascript
TokenManager.removeToken('AUTH');
```
Removes a token of the specified type.

**Parameters:**
- `type` (string): Token type

##### clearAllTokens()
```javascript
TokenManager.clearAllTokens();
```
Removes all stored tokens.

##### refreshToken(type)
```javascript
const newToken = await TokenManager.refreshToken('AUTH');
```
Refreshes a token of the specified type.

**Parameters:**
- `type` (string): Token type

**Returns:**
- `Promise<string|null>`: The new token or null if refresh fails

## Pinata Integration

### pinataClient

The `pinataClient` provides methods for interacting with the Pinata IPFS service.

#### Methods

##### pinFileToIPFS(file)
```javascript
const result = await pinataClient.pinFileToIPFS(file);
```
Uploads a file to IPFS via Pinata.

**Parameters:**
- `file` (File): The file to upload

**Returns:**
- `Promise<Object>`: The IPFS hash and metadata

##### groups.list()
```javascript
const groups = await pinataClient.groups.list();
```
Lists all Pinata groups.

**Returns:**
- `Promise<Array>`: List of groups

##### groups.create(name)
```javascript
const group = await pinataClient.groups.create('group-name');
```
Creates a new Pinata group.

**Parameters:**
- `name` (string): Name of the group

**Returns:**
- `Promise<Object>`: Created group details

##### groups.unpin(hash)
```javascript
const result = await pinataClient.groups.unpin('ipfs-hash');
```
Unpins a file from IPFS.

**Parameters:**
- `hash` (string): IPFS hash of the file

**Returns:**
- `Promise<string>`: Success message

## Security Utilities

### Security Functions

#### encryptData(data, key)
```javascript
const encrypted = encryptData('sensitive-data', 'encryption-key');
```
Encrypts sensitive data.

**Parameters:**
- `data` (string): Data to encrypt
- `key` (string): Encryption key

**Returns:**
- `string`: Encrypted data

#### decryptData(encryptedData, key)
```javascript
const decrypted = decryptData(encrypted, 'encryption-key');
```
Decrypts sensitive data.

**Parameters:**
- `encryptedData` (string): Encrypted data
- `key` (string): Encryption key

**Returns:**
- `string`: Decrypted data

#### sanitizeInput(input)
```javascript
const sanitized = sanitizeInput('<script>alert("xss")</script>');
```
Sanitizes input to prevent XSS attacks.

**Parameters:**
- `input` (string): Input to sanitize

**Returns:**
- `string`: Sanitized input

#### validateEthAddress(address)
```javascript
const isValid = validateEthAddress('0x...');
```
Validates Ethereum addresses.

**Parameters:**
- `address` (string): Address to validate

**Returns:**
- `boolean`: Whether the address is valid 