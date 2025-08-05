import { indianColleges, getHyderabadColleges, searchColleges } from './data/indianColleges.js';

console.log('=== COLLEGE DATABASE STATISTICS ===');
console.log(`Total colleges in database: ${indianColleges.length}`);

const hyderabadColleges = getHyderabadColleges();
console.log(`\nHyderabad & Telangana colleges: ${hyderabadColleges.length}`);

console.log('\n=== HYDERABAD COLLEGES LIST ===');
hyderabadColleges.forEach((college, index) => {
  console.log(`${index + 1}. ${college}`);
});

console.log('\n=== SEARCH TESTS ===');
console.log('Search "Hyderabad":', searchColleges('Hyderabad', 5));
console.log('Search "IIIT":', searchColleges('IIIT', 5));
console.log('Search "Osmania":', searchColleges('Osmania', 5));
console.log('Search "CBIT":', searchColleges('CBIT', 5));
console.log('Search "Warangal":', searchColleges('Warangal', 5));
