import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const PaymentScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.8)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    position: 'relative',
  },
  paymentMethodItemSelected: {
    borderColor: '#000000',
    backgroundColor: '#F8F9FA',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  paymentMethodCheck: {
    position: 'absolute',
    right: 16,
  },
  paymentOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentOptionArrow: {
    marginLeft: 8,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#000000',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  installmentOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  installmentOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#F8F9FA',
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  installmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  installmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  installmentDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  benefitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  benefitOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#F8F9FA',
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  benefitDiscount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  benefitCheck: {
    marginLeft: 8,
  },
  noBenefitOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    alignItems: 'center',
  },
  noBenefitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  sharedPaymentForm: {
    marginBottom: 16,
  },
  sharedPaymentFormTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  noParticipantsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  participantEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'right',
  },
  participantStatus: {
    fontSize: 12,
    textAlign: 'right',
  },
  statusPending: {
    color: '#F59E0B',
  },
  statusPaid: {
    color: '#10B981',
  },
  statusDeclined: {
    color: '#EF4444',
  },
  confirmModalButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});