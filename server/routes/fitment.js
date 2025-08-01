const express = require('express');
const Student = require('../models/Student');
const Job = require('../models/Job');
const router = express.Router();

// GET /api/fitment/:studentPhone/:jobId - Calculate fitment score
router.get('/:studentPhone/:jobId', async (req, res) => {
  try {
    const { studentPhone, jobId } = req.params;

    // Find student and job
    const student = await Student.findOne({ phone: studentPhone });
    const job = await Job.findOne({ jobId: jobId }) || await Job.findById(jobId);

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found' 
      });
    }

    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found' 
      });
    }

    // Calculate fitment score
    const fitmentResult = calculateFitment(student, job);

    res.json({
      message: 'Fitment calculated successfully',
      fitment: fitmentResult
    });

  } catch (error) {
    console.error('Error calculating fitment:', error);
    res.status(500).json({ 
      error: 'Failed to calculate fitment',
      message: error.message 
    });
  }
});

// Fitment calculation algorithm
function calculateFitment(student, job) {
  let totalScore = 0;
  let maxScore = 0;
  const reasons = [];

  // 1. Education Match (25 points)
  const educationScore = calculateEducationMatch(student.education, job.requirements.education);
  totalScore += educationScore.score;
  maxScore += 25;
  if (educationScore.reason) reasons.push(educationScore.reason);

  // 2. Experience Match (20 points)
  const experienceScore = calculateExperienceMatch(student.experience, job.requirements.experience);
  totalScore += experienceScore.score;
  maxScore += 20;
  if (experienceScore.reason) reasons.push(experienceScore.reason);

  // 3. Skills Match (25 points)
  const skillsScore = calculateSkillsMatch(student.skills, job.requirements.skills);
  totalScore += skillsScore.score;
  maxScore += 25;
  if (skillsScore.reason) reasons.push(skillsScore.reason);

  // 4. Assessment Score (20 points)
  const assessmentScore = calculateAssessmentMatch(student.assessmentScore);
  totalScore += assessmentScore.score;
  maxScore += 20;
  if (assessmentScore.reason) reasons.push(assessmentScore.reason);

  // 5. Location Match (10 points)
  const locationScore = calculateLocationMatch(student.preferredLocation, job.location);
  totalScore += locationScore.score;
  maxScore += 10;
  if (locationScore.reason) reasons.push(locationScore.reason);

  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    score: percentage,
    totalScore,
    maxScore,
    reasons,
    matchLevel: getMatchLevel(percentage),
    student: {
      name: student.name,
      phone: student.phone,
      education: student.education,
      experience: student.experience,
      skills: student.skills,
      assessmentScore: student.assessmentScore
    },
    job: {
      jobId: job.jobId,
      title: job.title,
      company: job.company,
      requirements: job.requirements,
      location: job.location
    }
  };
}

function calculateEducationMatch(studentEducation, jobEducation) {
  const educationLevels = {
    'High School': 1,
    'Diploma': 2,
    'Bachelor': 3,
    'Master': 4,
    'PhD': 5,
    'Any': 0
  };

  const studentLevel = educationLevels[studentEducation.degree] || 0;
  const jobLevel = educationLevels[jobEducation] || 0;

  if (jobLevel === 0) return { score: 25, reason: 'Education requirement is flexible' };
  if (studentLevel >= jobLevel) return { score: 25, reason: 'Education requirements met' };
  if (studentLevel >= jobLevel - 1) return { score: 15, reason: 'Education level close to requirement' };
  return { score: 5, reason: 'Education level below requirement' };
}

function calculateExperienceMatch(studentExperience, jobExperience) {
  const studentYears = studentExperience.years || 0;
  const jobMinYears = jobExperience.min || 0;
  const jobMaxYears = jobExperience.max || 10;

  if (studentYears >= jobMinYears && studentYears <= jobMaxYears) {
    return { score: 20, reason: 'Experience requirements met' };
  } else if (studentYears >= jobMinYears - 1) {
    return { score: 15, reason: 'Experience level close to requirement' };
  } else if (studentYears < jobMinYears) {
    return { score: 5, reason: 'Experience level below requirement' };
  } else {
    return { score: 10, reason: 'Overqualified for position' };
  }
}

function calculateSkillsMatch(studentSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 25, reason: 'No specific skills required' };
  }

  const studentSkillNames = studentSkills.map(skill => skill.name.toLowerCase());
  const jobSkillNames = jobSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = jobSkillNames.filter(skill => 
    studentSkillNames.some(studentSkill => 
      studentSkill.includes(skill) || skill.includes(studentSkill)
    )
  );

  const matchPercentage = (matchingSkills.length / jobSkillNames.length) * 100;
  const score = Math.round((matchPercentage / 100) * 25);

  if (matchPercentage >= 80) {
    return { score, reason: `Excellent skills match (${matchingSkills.length}/${jobSkillNames.length} skills)` };
  } else if (matchPercentage >= 50) {
    return { score, reason: `Good skills match (${matchingSkills.length}/${jobSkillNames.length} skills)` };
  } else if (matchPercentage >= 25) {
    return { score, reason: `Partial skills match (${matchingSkills.length}/${jobSkillNames.length} skills)` };
  } else {
    return { score, reason: `Limited skills match (${matchingSkills.length}/${jobSkillNames.length} skills)` };
  }
}

function calculateAssessmentMatch(assessmentScore) {
  const { technical, communication, problemSolving, teamwork } = assessmentScore;
  const averageScore = (technical + communication + problemSolving + teamwork) / 4;
  
  if (averageScore >= 80) {
    return { score: 20, reason: 'Excellent assessment scores' };
  } else if (averageScore >= 60) {
    return { score: 15, reason: 'Good assessment scores' };
  } else if (averageScore >= 40) {
    return { score: 10, reason: 'Average assessment scores' };
  } else {
    return { score: 5, reason: 'Below average assessment scores' };
  }
}

function calculateLocationMatch(studentLocations, jobLocation) {
  if (!studentLocations || studentLocations.length === 0) {
    return { score: 10, reason: 'No location preference specified' };
  }

  const jobLocationString = `${jobLocation.city || ''} ${jobLocation.state || ''} ${jobLocation.country || ''}`.toLowerCase();
  
  const locationMatch = studentLocations.some(location => 
    jobLocationString.includes(location.toLowerCase()) || 
    location.toLowerCase().includes(jobLocationString)
  );

  if (locationMatch) {
    return { score: 10, reason: 'Location preference matched' };
  } else {
    return { score: 5, reason: 'Location preference not matched' };
  }
}

function getMatchLevel(percentage) {
  if (percentage >= 90) return 'Excellent Match';
  if (percentage >= 75) return 'Very Good Match';
  if (percentage >= 60) return 'Good Match';
  if (percentage >= 40) return 'Fair Match';
  return 'Poor Match';
}

module.exports = router; 