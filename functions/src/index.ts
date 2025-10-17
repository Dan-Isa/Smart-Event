// ============================================
// FIREBASE CLOUD FUNCTIONS
// ============================================

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// ============================================
// EVENT TRIGGERS
// ============================================

/**
 * Trigger when a new event is created
 * Send notifications to relevant users
 */
export const onEventCreated = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const event = snap.data();
    const eventId = context.params.eventId;
    
    try {
      console.log(`Event created: ${event.title} (${eventId})`);
      
      // Get users who should be notified based on target audience
      const usersToNotify = await getTargetAudience(
        event.institution,
        event.targetAudience
      );
      
      // Create notifications for each user
      const batch = db.batch();
      const notificationsRef = db.collection('notifications');
      
      for (const user of usersToNotify) {
        // Skip the creator
        if (user.uid === event.creatorId) continue;
        
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          userId: user.uid,
          type: 'event_created',
          message: `New event: ${event.title}`,
          eventId: eventId,
          link: `/events/${eventId}`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      await batch.commit();
      console.log(`Created ${usersToNotify.length} notifications`);
      
      // Optional: Send email notifications
      // await sendEmailNotifications(usersToNotify, event);
      
    } catch (error) {
      console.error('Error in onEventCreated:', error);
    }
  });

/**
 * Trigger when an event is updated
 * Notify registered users
 */
export const onEventUpdated = functions.firestore
  .document('events/{eventId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const eventId = context.params.eventId;
    
    try {
      // Check if critical fields changed
      const criticalFieldsChanged = 
        before.title !== after.title ||
        before.date !== after.date ||
        before.location !== after.location;
      
      if (!criticalFieldsChanged) {
        return; // No need to notify
      }
      
      console.log(`Event updated: ${after.title} (${eventId})`);
      
      // Notify all registered students
      const registrations = after.registrations || [];
      
      if (registrations.length === 0) {
        return;
      }
      
      const batch = db.batch();
      const notificationsRef = db.collection('notifications');
      
      for (const registration of registrations) {
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          userId: registration.studentId,
          type: 'event_updated',
          message: `Event "${after.title}" has been updated`,
          eventId: eventId,
          link: `/events/${eventId}`,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      await batch.commit();
      console.log(`Notified ${registrations.length} registered students`);
      
    } catch (error) {
      console.error('Error in onEventUpdated:', error);
    }
  });

/**
 * Trigger when an event is deleted
 * Notify registered users
 */
export const onEventDeleted = functions.firestore
  .document('events/{eventId}')
  .onDelete(async (snap, context) => {
    const event = snap.data();
    const eventId = context.params.eventId;
    
    try {
      console.log(`Event deleted: ${event.title} (${eventId})`);
      
      const registrations = event.registrations || [];
      
      if (registrations.length === 0) {
        return;
      }
      
      const batch = db.batch();
      const notificationsRef = db.collection('notifications');
      
      for (const registration of registrations) {
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          userId: registration.studentId,
          type: 'event_cancelled',
          message: `Event "${event.title}" has been cancelled`,
          eventId: null,
          link: null,
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      await batch.commit();
      console.log(`Notified ${registrations.length} students about cancellation`);
      
    } catch (error) {
      console.error('Error in onEventDeleted:', error);
    }
  });

/**
 * Scheduled function to send event reminders
 * Runs daily at 9 AM
 */
export const sendEventReminders = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Running scheduled event reminders');
      
      // Get events happening in the next 24 hours
      const now = admin.firestore.Timestamp.now();
      const tomorrow = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      const eventsSnapshot = await db.collection('events')
        .where('date', '>=', now)
        .where('date', '<=', tomorrow)
        .get();
      
      if (eventsSnapshot.empty) {
        console.log('No events in the next 24 hours');
        return;
      }
      
      const batch = db.batch();
      const notificationsRef = db.collection('notifications');
      let notificationCount = 0;
      
      for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        const registrations = event.registrations || [];
        
        for (const registration of registrations) {
          const notificationRef = notificationsRef.doc();
          batch.set(notificationRef, {
            userId: registration.studentId,
            type: 'event_reminder',
            message: `Reminder: "${event.title}" is happening soon!`,
            eventId: eventDoc.id,
            link: `/events/${eventDoc.id}`,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          notificationCount++;
        }
      }
      
      if (notificationCount > 0) {
        await batch.commit();
        console.log(`Sent ${notificationCount} event reminders`);
      }
      
    } catch (error) {
      console.error('Error in sendEventReminders:', error);
    }
  });

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

/**
 * HTTP function to create a new user (Admin only)
 */
export const createUser = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }
  
  try {
    // Get caller's data
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    const caller = callerDoc.data();
    
    // Check if caller is admin
    if (!caller || caller.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can create users'
      );
    }
    
    // Create authentication user
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.temporaryPassword,
      emailVerified: false,
    });
    
    // Create Firestore user document
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: data.email,
      username: data.email.split('@')[0],
      role: data.role,
      institution: caller.institution,
      department: data.department || null,
      class: data.class || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`User created: ${data.email} (${userRecord.uid})`);
    
    return {
      success: true,
      userId: userRecord.uid,
      email: data.email,
      temporaryPassword: data.temporaryPassword,
    };
    
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to create user'
    );
  }
});

/**
 * HTTP function to delete a user (Admin only)
 */
export const deleteUser = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }
  
  try {
    // Get caller's data
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    const caller = callerDoc.data();
    
    // Check if caller is admin
    if (!caller || caller.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can delete users'
      );
    }
    
    // Prevent self-deletion
    if (data.userId === context.auth.uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Cannot delete your own account'
      );
    }
    
    // Get user to delete
    const userDoc = await db.collection('users').doc(data.userId).get();
    const userToDelete = userDoc.data();
    
    // Check institution match
    if (!userToDelete || userToDelete.institution !== caller.institution) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot delete users from other institutions'
      );
    }
    
    // Delete authentication account
    await admin.auth().deleteUser(data.userId);
    
    // Delete Firestore document
    await db.collection('users').doc(data.userId).delete();
    
    console.log(`User deleted: ${data.userId}`);
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to delete user'
    );
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get target audience users for notifications
 */
async function getTargetAudience(
  institution: string,
  targetAudience: any
): Promise<any[]> {
  const usersRef = db.collection('users');
  let query = usersRef.where('institution', '==', institution);
  
  // Filter by role - only students get notifications
  query = query.where('role', '==', 'student');
  
  if (targetAudience.type === 'department' && targetAudience.value) {
    query = query.where('department', '==', targetAudience.value);
  } else if (targetAudience.type === 'class' && targetAudience.value) {
    query = query.where('class', '==', targetAudience.value);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

/**
 * Optional: Send email notifications using a service like SendGrid
 */
// async function sendEmailNotifications(users: any[], event: any) {
//   // Implement email sending logic here
//   // Example with SendGrid:
//   /*
//   const sgMail = require('@sendgrid/mail');
//   sgMail.setApiKey(functions.config().sendgrid.key);
//   
//   const messages = users.map(user => ({
//     to: user.email,
//     from: 'noreply@yourdomain.com',
//     subject: `New Event: ${event.title}`,
//     html: `
//       <h1>New Event Available</h1>
//       <p><strong>${event.title}</strong></p>
//       <p>${event.description}</p>
//       <p>Date: ${event.date.toDate().toLocaleString()}</p>
//       <p>Location: ${event.location}</p>
//     `,
//   }));
//   
//   await sgMail.send(messages);
//   */
// }