CREATE DATABASE IF NOT EXISTS college_voting;

USE college_voting;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('SUPER_ADMIN', 'ADMIN', 'STUDENT') NOT NULL,

    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',

    must_change_password BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    code VARCHAR(20) NOT NULL UNIQUE,

    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE years (
    id INT AUTO_INCREMENT PRIMARY KEY,

    department_id INT NOT NULL,

    name VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_year_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE,

    UNIQUE (department_id, name)
);

CREATE TABLE sections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    year_id INT NOT NULL,

    name VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_section_year
        FOREIGN KEY (year_id)
        REFERENCES years(id)
        ON DELETE CASCADE,

    UNIQUE (year_id, name)
);




CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    student_id VARCHAR(50) NOT NULL UNIQUE,

    full_name VARCHAR(150) NOT NULL,

    department_id INT NOT NULL,

    year_id INT NOT NULL,

    section_id INT NOT NULL,

    phone VARCHAR(20),

    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_student_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id),

    CONSTRAINT fk_student_year
        FOREIGN KEY (year_id)
        REFERENCES years(id),

    CONSTRAINT fk_student_section
        FOREIGN KEY (section_id)
        REFERENCES sections(id)
);


CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    full_name VARCHAR(150) NOT NULL,

    department_id INT NOT NULL,

    year_id INT,

    section_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_admin_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id),

    CONSTRAINT fk_admin_year
        FOREIGN KEY (year_id)
        REFERENCES years(id),

    CONSTRAINT fk_admin_section
        FOREIGN KEY (section_id)
        REFERENCES sections(id)
);


CREATE TABLE elections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    start_date DATETIME NOT NULL,

    end_date DATETIME NOT NULL,

    status ENUM(
        'DRAFT',
        'UPCOMING',
        'ACTIVE',
        'CLOSED',
        'RESULT_PUBLISHED'
    ) DEFAULT 'DRAFT',

    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_election_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);


CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    election_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_position_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    UNIQUE (election_id, name)
);



CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,

    election_id INT NOT NULL,

    position_id INT NOT NULL,

    student_id INT NOT NULL,

    manifesto TEXT,

    photo_url VARCHAR(500),

    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidate_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_candidate_position
        FOREIGN KEY (position_id)
        REFERENCES positions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_candidate_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE (election_id, position_id, student_id)
);


CREATE TABLE eligible_voters (
    id INT AUTO_INCREMENT PRIMARY KEY,

    election_id INT NOT NULL,

    student_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eligible_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_eligible_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE (election_id, student_id)
);

CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    election_id INT NOT NULL,

    position_id INT NOT NULL,

    candidate_id INT NOT NULL,

    student_id INT NOT NULL,

    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vote_election
        FOREIGN KEY (election_id)
        REFERENCES elections(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_position
        FOREIGN KEY (position_id)
        REFERENCES positions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    -- Prevent a student from voting twice
    -- for the same position in the same election
    UNIQUE (election_id, position_id, student_id)
);


CREATE TABLE otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    otp_code VARCHAR(10) NOT NULL,

    purpose ENUM(
        'LOGIN',
        'FORGOT_PASSWORD',
        'EMAIL_VERIFICATION'
    ) NOT NULL,

    expires_at DATETIME NOT NULL,

    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);



CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    action VARCHAR(100) NOT NULL,

    description TEXT,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);