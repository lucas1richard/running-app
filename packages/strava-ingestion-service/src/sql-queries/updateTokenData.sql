UPDATE tokens
SET
  access_token = ?,
  refresh_token = ?,
  expires = ?
WHERE
  id = ?;