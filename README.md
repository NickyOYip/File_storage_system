File Storage System
Group 55
Name: 
Ieong Kai Yip 13314481
Wong Ka Ho 13251975
Tai Tsz Hin 13275125

Application link: https://s381f-file-storage-system.onrender.com/
github link: https://github.com/NickyOYip1/S381F_file_storage_system
********************************************
# Login
Through the login interface, user can access the file storage system by entering email and password.
Example admin account:
{
Email: nickyieongo@gmail.com
Password: 123
}
Example user account:
{
Email: s1331448@live.hkmu.edu.hk
Password: 123
}

also you can register a new account by clicking register.

After successful login, userId is stored in session.
********************************************
# Logout
In the Home page, each user can logout the account by clicking logout.
After successful Logout, session is cleared.
********************************************
# CRUD service
- Create
- A file document contains the following attributes with an example: 
    1) File Name (example.jpg)
    2) File Data (binary data)
	3) create new user
All files are stored securely in MongoDB. The newly uploaded file will be shown on the user home page.
All user are stored securely in MongoDB. All users will be shown on the admin home page.
********************************************
#All uploaded files should not be larger than 1MB(within 50kb is recommended)
********************************************
# CRUD service
-Read
- 1) After login, the home page will list out all files uploaded by the user
     showing: Sequential ID, File Name, Upload Date

  2) Search functionality
     Users can view their files and download them
     If no files are found, it will show "No files found"

All data are get from MongoDB.
********************************************
# CRUD service
- Edit & Update 
- Users can rename their files with:
    1) Original File Name (example.jpg)
    2) New File Name (renamed.jpg)

Files maintain their original Sequential ID and Upload Date after renaming.


********************************************
# CRUD service
-Delete
- Users can delete their files through the delete button on the home page
- admin can delete any user from the admin home page

********************************************
# Restful
The system provides RESTful API endpoints:

1. GET /api/files/:email - Read all files
   Success Example:
   ```
   GET /api/files/s1331448@live.hkmu.edu.hk
   ```
   Error Example:
   ```
   GET /api/files/nonexistent@email.com
   ```

2. POST /api/users - Create new user
   Success Example:
   ```
   POST /api/users
   Body: {
       "email": "test@example.com",
       "password": "password123",
       "role": "user"
   }
   ```
   Error Example:
   ```
   POST /api/users
   Body: {
       "email": "s1331448@live.hkmu.edu.hk",
       "password": "123",
       "role": "user"
   }
   ```

3. PUT /api/files - Update file name
   Success Example:
   ```
   PUT /api/files
   Body: {
       "email": "s1331448@live.hkmu.edu.hk",
       "fileId": "67489fba3d28950e56419832_4",
       "newFileName": "renamed_file.jpg"
   }
   ```
   Error Example:
   ```
   PUT /api/files
   Body: {
       "email": "s1331448@live.hkmu.edu.hk",
       "fileId": "invalid_file_id",
       "newFileName": "new.jpg"
   }
   ```

4. DELETE /api/files - Delete file
   Success Example:
   ```
   DELETE /api/files
   Body: {
       "email": "s1331448@live.hkmu.edu.hk",
       "fileId": "67489fba3d28950e56419832_4"
   }
   ```
   Error Example:
   ```
   DELETE /api/files
   Body: {
       "email": "s1331448@live.hkmu.edu.hk",
       "fileId": "nonexistent_file"
   }
   ```

Each endpoint follows RESTful principles with proper request/response handling.

********************************************

