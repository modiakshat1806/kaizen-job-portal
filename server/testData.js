const mongoose = require('mongoose');
const JobApplication = require('./models/JobApplication');
const SavedJob = require('./models/SavedJob');
const Job = require('./models/Job');
const Student = require('./models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaizen-job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('Creating test data...');

    // Get some existing jobs
    const jobs = await Job.find().limit(3);
    if (jobs.length === 0) {
      console.log('No jobs found. Please create some jobs first.');
      return;
    }

    // Create test students if they don't exist
    const testStudents = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        education: {
          degree: 'BTech',
          field: 'Computer Science',
          institution: 'IIT Delhi',
          graduationYear: 2024
        },
        careerGoals: 'Software Engineer at a leading tech company',
        skills: [
          { name: 'JavaScript', level: 'Advanced' },
          { name: 'React', level: 'Intermediate' },
          { name: 'Node.js', level: 'Intermediate' }
        ],
        experience: {
          years: 1,
          description: 'Intern at tech startup'
        },
        assessmentScore: {
          technical: 85,
          communication: 78,
          problemSolving: 82,
          teamwork: 88
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '9876543211',
        education: {
          degree: 'BTech',
          field: 'Information Technology',
          institution: 'NIT Trichy',
          graduationYear: 2024
        },
        careerGoals: 'Data Scientist specializing in machine learning',
        skills: [
          { name: 'Python', level: 'Advanced' },
          { name: 'Machine Learning', level: 'Intermediate' },
          { name: 'SQL', level: 'Advanced' }
        ],
        experience: {
          years: 0,
          description: 'Fresh graduate'
        },
        assessmentScore: {
          technical: 92,
          communication: 85,
          problemSolving: 89,
          teamwork: 91
        }
      },
      {
        name: 'Raj Patel',
        email: 'raj.patel@example.com',
        phone: '9876543212',
        education: {
          degree: 'MCA',
          field: 'Computer Applications',
          institution: 'Delhi University',
          graduationYear: 2023
        },
        careerGoals: 'Full-stack web developer with expertise in modern frameworks',
        skills: [
          { name: 'PHP', level: 'Advanced' },
          { name: 'Laravel', level: 'Intermediate' },
          { name: 'MySQL', level: 'Advanced' }
        ],
        experience: {
          years: 2,
          description: 'Full-stack developer'
        },
        assessmentScore: {
          technical: 88,
          communication: 82,
          problemSolving: 85,
          teamwork: 87
        }
      }
    ];

    // Create students
    for (const studentData of testStudents) {
      const existingStudent = await Student.findOne({ phone: studentData.phone });
      if (!existingStudent) {
        const student = new Student(studentData);
        await student.save();
        console.log(`Created student: ${studentData.name}`);
      }
    }

    // Create job applications
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const student = testStudents[i];

      // Check if application already exists
      const existingApplication = await JobApplication.findOne({
        studentPhone: student.phone,
        jobId: job.jobId
      });

      if (!existingApplication) {
        const application = new JobApplication({
          studentPhone: student.phone,
          studentName: student.name,
          studentEmail: student.email,
          jobId: job.jobId,
          jobTitle: job.title,
          companyName: job.company.name,
          fitmentScore: 75 + Math.floor(Math.random() * 20), // Random score between 75-95
          studentDetails: {
            education: student.education,
            skills: student.skills.map(s => s.name),
            experience: student.experience,
            assessmentScore: student.assessmentScore
          }
        });

        await application.save();
        console.log(`Created application: ${student.name} -> ${job.title} at ${job.company.name}`);

        // Update job application count
        await Job.findByIdAndUpdate(job._id, {
          $inc: { applicationCount: 1 }
        });
      }
    }

    // Create some saved jobs
    for (let i = 0; i < 2; i++) {
      const job = jobs[i];
      const student = testStudents[i];

      const existingSave = await SavedJob.findOne({
        studentPhone: student.phone,
        jobId: job.jobId
      });

      if (!existingSave) {
        const savedJob = new SavedJob({
          studentPhone: student.phone,
          jobId: job.jobId,
          jobTitle: job.title,
          companyName: job.company.name,
          jobDetails: {
            description: job.description,
            location: job.location,
            salary: job.salary,
            jobType: job.jobType,
            industry: job.industry,
            requirements: job.requirements
          }
        });

        await savedJob.save();
        console.log(`Created saved job: ${student.name} saved ${job.title}`);
      }
    }

    console.log('Test data created successfully!');
    console.log('\nTest phone numbers to try:');
    console.log('- 9876543210 (John Doe)');
    console.log('- 9876543211 (Jane Smith)');
    console.log('- 9876543212 (Raj Patel)');
    
    console.log('\nTest company names to try:');
    const uniqueCompanies = [...new Set(jobs.map(job => job.company.name))];
    uniqueCompanies.forEach(company => console.log(`- ${company}`));

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();
