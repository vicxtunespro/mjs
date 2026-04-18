// components/PDFIDCard.tsx
import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { Student, IDCardDocumentProps, IDCardProps } from '@/types/id.types';

// PDF Styles - react-pdf doesn't support Tailwind
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
  },
  card: {
    width: '100%',
    height: '100%',
    padding: 20,
    backgroundColor: '#ffffff',
    border: '2px solid #1e3c72',
    borderRadius: 10,
    position: 'relative',
  },
  schoolHeader: {
    textAlign: 'center',
    marginBottom: 15,
    borderBottom: '2px solid #1e3c72',
    paddingBottom: 10,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3c72',
    marginBottom: 4,
  },
  schoolMotto: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  photoContainer: {
    width: 100,
    height: 120,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #ddd',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  details: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 6,
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    paddingBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#555',
    width: 80,
  },
  value: {
    fontSize: 9,
    color: '#333',
    flex: 1,
  },
  qrSection: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #ddd',
    paddingTop: 12,
  },
  qrContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  qrInfo: {
    flex: 1,
    marginLeft: 10,
  },
  footer: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
    borderTop: '1px solid #ddd',
    paddingTop: 8,
  },
  signature: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    fontSize: 8,
    fontStyle: 'italic',
  },
});

const getFullName = (name: Student['name']): string => {
  const parts = [name.first_name, name.other_names, name.last_name].filter(Boolean);
  return parts.join(' ');
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const PDFIDCard: React.FC<IDCardProps> = ({ student }) => (
  <View style={styles.card}>
    <View style={styles.schoolHeader}>
      <Text style={styles.schoolName}>MJS EDUCATIONAL CENTRE</Text>
      <Text style={styles.schoolMotto}>"Excellence in Education"</Text>
    </View>
    
    <Text style={styles.title}>STUDENT IDENTITY CARD</Text>
    
    <View style={styles.content}>
      <View style={styles.photoContainer}>
        {student.photo && student.photo !== '' ? (
          <Image src={student.photo} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={{ fontSize: 8, color: '#999' }}>No Photo</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{getFullName(student.name)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Registration ID:</Text>
          <Text style={styles.value}>{student.registration_id}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>LIN:</Text>
          <Text style={styles.value}>{student.LIN}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{student.gender}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{formatDate(student.date_of_birth)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Class:</Text>
          <Text style={styles.value}>
            {student.class.name} {student.class.stream ? `(${student.class.stream})` : ''}
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.qrSection}>
      <View style={styles.qrContainer}>
        {student.qr_code?.cloudinary_url && (
          <Image src={student.qr_code.cloudinary_url} style={styles.qrImage} />
        )}
      </View>
      <View style={styles.qrInfo}>
        <Text style={{ fontSize: 7, color: '#666' }}>Scan to Verify</Text>
        <Text style={{ fontSize: 6, color: '#999', marginTop: 4 }}>
          ID: {student.registration_id}
        </Text>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text>Valid ID Card - Issued by MJS Educational Centre</Text>
      <View style={styles.signature}>
        <Text style={styles.signatureLine}>Student's Signature</Text>
        <Text style={styles.signatureLine}>Authorized Signatory</Text>
      </View>
    </View>
  </View>
);

export const PDFIDCardDocument: React.FC<IDCardDocumentProps> = ({ students }) => (
  <Document>
    {students.map((student) => (
      <Page key={student._id} size="A6" style={styles.page}>
        <PDFIDCard student={student} />
      </Page>
    ))}
  </Document>
);