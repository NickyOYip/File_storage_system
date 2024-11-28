Employee Management System
Group 39
Name: Kwok Yuk Ming (13331858);
Tai Tsz Hin (13275125);
Yeung Chun Hei(12527138);
Tin Chi Yu(13165803)

Application link: https://s381f-project-employeemanagementsystem.onrender.com/

********************************************
# Login
Through the login interface, user can access the human resources management system by entering username and password.
{
Username: admin 
Password: password
}

After successful login, userid is sotred in session.

********************************************
# Logout
In the Home page, each user can log out the account by clicking logout.

********************************************
# CRUD service
- Create
-	An employee document contains the following attributes with an example: 
	1) Employee First Name (Tom)
	2) Employee Last Name (Tai)
	3) Employee Telephone (12345678) *telephone number must be 8 digits
	4) Employee Email (s1234@gmail.com) *must follow format xxxx@xxxx.xxx
	5) Description (Diligence person)

All attributes are mandatory. Then the newly added emplyee information will be shown at the home page.

********************************************
# CRUD service
-Read
-	1) After login, the home page will list out the basic information of the employee ( Employee First and last Name; Telephone; Email ), clicking the eyes button, the details will be displayed

	2) Search bar
	Inputting the keyword in the search bar can filter the employee without the keyword.    
	If all employees both without the keyword, it will show "No results found".

********************************************
# CRUD service
- Edit & Update 
-	The user can edit and update all employee information by clicking the yellow pencil button.
-	An employee document contains the following attributes with an example: 
	1) Employee First Name (Tom)
	2) Employee Last Name (Tin)
	3) Employee Telephone (21345678) *telephone number must be 8 digits
	4) Employee Email (s12345@gmail.com) *must follow format xxxx@xxxx.xxxx
	5) Description (Diligence person)

	For example, we edited the last name, email, and telephone number and updated to MongoDB.

********************************************
# CRUD service
-Delete
-	The user can delete the employee information through the red button in the home page.
        Or delete in editing mode by pressing the red button.

********************************************
# Restful
	There is req and res in our js file. And the GET, POST, PUT, Delete, We used Restful to use CRUD.

********************************************





