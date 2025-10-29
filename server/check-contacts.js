require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const User = require('./models/User');

console.log('🔍 CHECKING EMERGENCY CONTACTS\n');
console.log('═'.repeat(60));

async function checkContacts() {
  try {
    console.log('\n⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} user(s) in database\n`);

    for (const user of users) {
      console.log('─'.repeat(60));
      console.log(`\n👤 USER: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);

      // Get contacts for this user
      const contacts = await Contact.find({ userId: user._id });
      console.log(`\n   📋 Emergency Contacts: ${contacts.length}`);

      if (contacts.length === 0) {
        console.log('\n   ⚠️  NO CONTACTS FOUND!');
        console.log('   💡 Add contacts at: http://localhost:5173/contacts\n');
        continue;
      }

      contacts.forEach((contact, index) => {
        console.log(`\n   Contact ${index + 1}:`);
        console.log(`   ├─ Name: ${contact.name}`);
        console.log(`   ├─ Relation: ${contact.relation || 'N/A'}`);
        console.log(`   ├─ Phone: ${contact.phone || '❌ NOT PROVIDED'}`);
        console.log(`   └─ Email: ${contact.email || '❌ NOT PROVIDED'}`);

        // Validate phone format
        if (contact.phone) {
          if (contact.phone.startsWith('+91')) {
            // Check if it's one of the verified numbers
            const verifiedNumbers = [
              '+918529596981',
              '+919646787567',
              '+917499461772',
              '+919145291452',
              '+918530976939'
            ];
            
            const isVerified = verifiedNumbers.includes(contact.phone);
            if (isVerified) {
              console.log(`      ✅ Phone format correct and VERIFIED in Twilio`);
            } else {
              console.log(`      ⚠️  Phone format OK but NOT VERIFIED in Twilio`);
              console.log(`      💡 Verify this number in Twilio Console`);
            }
          } else {
            console.log(`      ❌ INVALID FORMAT! Must start with +91`);
            console.log(`      💡 Update to: +91${contact.phone.replace(/^0+/, '')}`);
          }
        } else {
          console.log(`      ❌ No phone number - SMS won't be sent`);
        }
      });

      console.log('\n   📊 Summary:');
      const withPhone = contacts.filter(c => c.phone && c.phone.trim() !== '');
      const withEmail = contacts.filter(c => c.email && c.email.trim() !== '');
      const withValidPhone = contacts.filter(c => c.phone && c.phone.startsWith('+91'));
      
      console.log(`   ├─ With phone: ${withPhone.length}`);
      console.log(`   ├─ With email: ${withEmail.length}`);
      console.log(`   └─ With valid phone format (+91): ${withValidPhone.length}`);

      if (withValidPhone.length === 0) {
        console.log(`\n   ⚠️  WARNING: No contacts with valid phone numbers!`);
        console.log(`   💡 SMS alerts will NOT be sent until you add valid phone numbers`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ DIAGNOSIS COMPLETE\n');

    console.log('💡 NEXT STEPS:\n');
    console.log('1. Go to: http://localhost:5173/contacts');
    console.log('2. Edit each contact');
    console.log('3. Update phone to one of your verified numbers:');
    console.log('   • +918529596981');
    console.log('   • +919646787567');
    console.log('   • +917499461772');
    console.log('   • +919145291452');
    console.log('   • +918530976939');
    console.log('4. Save the contact');
    console.log('5. Trigger SOS again\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkContacts();

