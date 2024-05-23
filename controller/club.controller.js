const Club = require('../model/club.model');
const User = require('../model/user.model');

// Get all clubs
async function getAllClubs(req, res) {
  try {
    const clubs = await Club.find().populate('leader', 'username');
    res.status(200).json({ clubs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


// Get club details by ID
async function getClubById(req, res) {
    try {
        const { id } = req.params;
        const club = await Club.findById(id).populate('leader', 'username').populate('members', 'username');
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }
        res.status(200).json({ club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}


// Create a club (accessible only to admins)
async function createClub(req, res) {
  try {
    // Allow creating clubs with any fields by directly passing the request body to the Club model
    const newClub = new Club(req.body);
    await newClub.save();

    // Respond with a success message and the created club object
    res.status(201).json({ message: 'Club created successfully', club: newClub });
  } catch (error) {
    // Handle errors by logging them and sending an error response
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Delete a club (accessible only to admins)
async function deleteClub(req, res) {
  try {
    const { id } = req.params;
    const deletedClub = await Club.findByIdAndDelete(id);
    if (!deletedClub) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.status(200).json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Assign club leader (accessible only to admins)
// Assign club leader (accessible only to admins)
async function assignClubLeader(req, res) {
    try {
      const { clubId, userId } = req.body;
  
      // Check if the user making the request is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admin only' });
      }
  
      // Check if the club exists
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }
  
      // Update the leader of the club
      club.leader = userId;
      await club.save();
  
      // Update the role of the new club leader to "club_admin"
      const user = await User.findByIdAndUpdate(userId, { role: 'club_admin' }, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Club leader assigned successfully', club });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
}

// Edit club details (accessible only to club admins)
async function editClubDetails(req, res) {
    try {
        const { id } = req.params;
        const { name, description, leader, members, status } = req.body;

        // Find the club by ID
        let club = await Club.findById(id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check if the requester is the club leader
        if (!club.leader.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access Denied: Club Leader only' });
        }

        // Update club details
        club.name = name;
        club.description = description;
        club.leader = leader; // Make sure leader is assigned correctly as ObjectId
        club.members = members;
        club.status = status;

        // Save the updated club
        await club.save();

        res.status(200).json({ message: 'Club details updated successfully', club });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
// Approve or deny student membership (accessible only to club admins)
async function approveDenyStudentMembership(req, res) {
  try {
    const { clubId, userId, action } = req.body;
    
    // Find the club and user by their IDs
    const club = await Club.findById(clubId);
    const user = await User.findById(userId);
    
    if (!club || !user) {
      return res.status(404).json({ message: 'Club or user not found' });
    }

    // Check if the requester is a club admin
    if (!club.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access Denied: Only club leaders can approve/deny student membership' });
    }

    // Handle membership approval or denial
    if (action === 'approve') {
      if (!club.members.includes(userId)) {
        club.members.push(userId); // Add user to members list if not already a member
      }
    } else if (action === 'deny') {
      club.members.pull(userId); // Remove user from members list if they were denied membership
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Save the updated club
    await club.save();
    
    res.status(200).json({ message: 'Student membership updated successfully', club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Get club ID by club admin's ID
// Get club ID by club admin's ID
async function getClubIdByAdminId(req, res) {
  try {
    // Check if the requester is a club admin
    if (req.user.role !== 'club_admin') {
      return res.status(403).json({ message: 'Access Denied: Club Admin only' });
    }
    
    // Find the club where the user is the leader (club admin)
    const club = await Club.findOne({ leader: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found for the current user' });
    }

    // Return the club ID as a string
    res.status(200).json({ clubId: club._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


module.exports = { getAllClubs,getClubById, getClubIdByAdminId,createClub, deleteClub, assignClubLeader, editClubDetails, approveDenyStudentMembership };
