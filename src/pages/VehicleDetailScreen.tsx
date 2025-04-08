import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../types';
import SmartFeaturesService from '../services/SmartFeaturesService';
import ConvenienceService, { 
  MaintenanceSchedule, 
  MaintenanceHistory, 
  PriceComparison,
  Favorite
} from '../services/ConvenienceService';

// Função para formatar data no formato dd/MM/yyyy
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

interface VehicleDetailScreenProps {
  vehicle: Vehicle;
  onBack: () => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({
  vehicle,
  onBack,
  styles,
  colors,
  scale,
}) => {
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [insuranceQuote, setInsuranceQuote] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<MaintenanceHistory[]>([]);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [newSchedule, setNewSchedule] = useState<{
    serviceType: string;
    scheduledDate: Date;
    notes: string;
  }>({
    serviceType: '',
    scheduledDate: new Date(),
    notes: ''
  });
  
  const smartFeaturesService = SmartFeaturesService.getInstance();
  const convenienceService = ConvenienceService.getInstance();
  const userId = 'user123'; // Em um app real, isso viria de um contexto de autenticação

  useEffect(() => {
    loadVehicleData();
  }, [vehicle]);

  const loadVehicleData = async () => {
    try {
      // Carrega dados de manutenção
      const schedules = await convenienceService.getMaintenanceSchedules(vehicle.id);
      setMaintenanceSchedule(schedules);

      // Carrega histórico de serviços
      const history = await convenienceService.getMaintenanceHistory(vehicle.id);
      setServiceHistory(history);

      // Carrega comparações de preço
      const comparisons = await convenienceService.getAllPriceComparisons();
      setPriceComparisons(comparisons);

      // Carrega favoritos
      const userFavorites = await convenienceService.getFavorites(userId, 'vehicle');
      setFavorites(userFavorites);
      
      // Verifica se o veículo está nos favoritos
      const isVehicleFavorite = await convenienceService.isFavorite(userId, vehicle.id);
      setIsFavorite(isVehicleFavorite);

      // Carrega cotação de seguro
      const quote = await smartFeaturesService.getInsuranceQuote(vehicle.id);
      setInsuranceQuote(quote);
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!newSchedule.serviceType) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de serviço');
      return;
    }

    try {
      await convenienceService.scheduleMaintenance(
        vehicle.id,
        newSchedule.serviceType,
        newSchedule.scheduledDate,
        newSchedule.notes
      );
      
      // Recarrega os dados
      const schedules = await convenienceService.getMaintenanceSchedules(vehicle.id);
      setMaintenanceSchedule(schedules);
      
      setShowScheduleModal(false);
      setNewSchedule({
        serviceType: '',
        scheduledDate: new Date(),
        notes: ''
      });
      
      Alert.alert('Sucesso', 'Manutenção agendada com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar manutenção:', error);
      Alert.alert('Erro', 'Não foi possível agendar a manutenção. Tente novamente.');
    }
  };

  const handleAddMaintenanceRecord = async () => {
    try {
      await convenienceService.addMaintenanceRecord(
        vehicle.id,
        'Manutenção Geral',
        'Oficina Central',
        150.00,
        50000,
        'Manutenção de rotina',
        new Date(new Date().setMonth(new Date().getMonth() + 6))
      );
      
      // Recarrega os dados
      const history = await convenienceService.getMaintenanceHistory(vehicle.id);
      setServiceHistory(history);
      
      Alert.alert('Sucesso', 'Registro de manutenção adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar registro de manutenção:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o registro. Tente novamente.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Remove dos favoritos
        const favorite = favorites.find(f => f.itemId === vehicle.id);
        if (favorite) {
          await convenienceService.removeFavorite(favorite.id);
        }
      } else {
        // Adiciona aos favoritos
        await convenienceService.addFavorite(
          userId,
          'vehicle',
          vehicle.id,
          vehicle.model,
          {
            plate: vehicle.plate,
            color: vehicle.color
          }
        );
      }
      
      // Atualiza o estado
      setIsFavorite(!isFavorite);
      
      // Recarrega os favoritos
      const userFavorites = await convenienceService.getFavorites(userId, 'vehicle');
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos. Tente novamente.');
    }
  };

  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={[localStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[localStyles.modalContent, { backgroundColor: colors.card }]}>
          <View style={localStyles.modalHeader}>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              Agendar Manutenção
            </Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={localStyles.formGroup}>
            <Text style={[localStyles.formLabel, { color: colors.text }]}>
              Tipo de Serviço
            </Text>
            <TextInput
              style={[localStyles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Ex: Troca de Óleo"
              placeholderTextColor={colors.placeholder}
              value={newSchedule.serviceType}
              onChangeText={(text) => setNewSchedule({...newSchedule, serviceType: text})}
            />
          </View>
          
          <View style={localStyles.formGroup}>
            <Text style={[localStyles.formLabel, { color: colors.text }]}>
              Data
            </Text>
            <TextInput
              style={[localStyles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.placeholder}
              value={formatDate(newSchedule.scheduledDate)}
              onChangeText={(text) => {
                // Em um app real, usaria um DatePicker
                const parts = text.split('/');
                if (parts.length === 3) {
                  const day = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1;
                  const year = parseInt(parts[2], 10);
                  const date = new Date(year, month, day);
                  if (!isNaN(date.getTime())) {
                    setNewSchedule({...newSchedule, scheduledDate: date});
                  }
                }
              }}
            />
          </View>
          
          <View style={localStyles.formGroup}>
            <Text style={[localStyles.formLabel, { color: colors.text }]}>
              Observações
            </Text>
            <TextInput
              style={[localStyles.input, localStyles.textArea, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Observações adicionais"
              placeholderTextColor={colors.placeholder}
              value={newSchedule.notes}
              onChangeText={(text) => setNewSchedule({...newSchedule, notes: text})}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity
            style={[localStyles.button, { backgroundColor: colors.primary }]}
            onPress={handleScheduleMaintenance}
          >
            <Text style={localStyles.buttonText}>Agendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderHistoryModal = () => (
    <Modal
      visible={showHistoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowHistoryModal(false)}
    >
      <View style={[localStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[localStyles.modalContent, { backgroundColor: colors.card }]}>
          <View style={localStyles.modalHeader}>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              Histórico de Manutenções
            </Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {serviceHistory.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Ionicons name="construct" size={48} color={colors.placeholder} />
              <Text style={[localStyles.emptyStateText, { color: colors.placeholder }]}>
                Nenhum histórico de manutenção encontrado
              </Text>
              <TouchableOpacity
                style={[localStyles.button, { backgroundColor: colors.primary }]}
                onPress={handleAddMaintenanceRecord}
              >
                <Text style={localStyles.buttonText}>Adicionar Registro</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={serviceHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[localStyles.historyItem, { borderBottomColor: colors.border }]}>
                  <View style={localStyles.historyItemHeader}>
                    <Text style={[localStyles.historyItemTitle, { color: colors.text }]}>
                      {item.serviceType}
                    </Text>
                    <Text style={[localStyles.historyItemDate, { color: colors.placeholder }]}>
                      {formatDate(new Date(item.date))}
                    </Text>
                  </View>
                  <View style={localStyles.historyItemDetails}>
                    <Text style={[localStyles.historyItemDetail, { color: colors.text }]}>
                      Oficina: {item.workshop}
                    </Text>
                    <Text style={[localStyles.historyItemDetail, { color: colors.text }]}>
                      Custo: R$ {item.cost.toFixed(2)}
                    </Text>
                    <Text style={[localStyles.historyItemDetail, { color: colors.text }]}>
                      Quilometragem: {item.mileage} km
                    </Text>
                  </View>
                  {item.nextServiceDate && (
                    <Text style={[localStyles.nextServiceDate, { color: colors.primary }]}>
                      Próximo serviço: {formatDate(new Date(item.nextServiceDate))}
                    </Text>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderComparisonModal = () => (
    <Modal
      visible={showComparisonModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowComparisonModal(false)}
    >
      <View style={[localStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[localStyles.modalContent, { backgroundColor: colors.card }]}>
          <View style={localStyles.modalHeader}>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              Comparativo de Preços
            </Text>
            <TouchableOpacity onPress={() => setShowComparisonModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {priceComparisons.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Ionicons name="pricetag" size={48} color={colors.placeholder} />
              <Text style={[localStyles.emptyStateText, { color: colors.placeholder }]}>
                Nenhum comparativo de preços disponível
              </Text>
            </View>
          ) : (
            <FlatList
              data={priceComparisons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[localStyles.comparisonItem, { borderBottomColor: colors.border }]}>
                  <View style={localStyles.comparisonItemHeader}>
                    <Text style={[localStyles.comparisonItemTitle, { color: colors.text }]}>
                      {item.serviceType}
                    </Text>
                    <Text style={[localStyles.comparisonItemSubtitle, { color: colors.placeholder }]}>
                      {item.vehicleType}
                    </Text>
                  </View>
                  
                  <View style={localStyles.priceSummary}>
                    <View style={localStyles.priceItem}>
                      <Text style={[localStyles.priceLabel, { color: colors.placeholder }]}>
                        Menor Preço
                      </Text>
                      <Text style={[localStyles.priceValue, { color: colors.success }]}>
                        R$ {item.lowestPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={localStyles.priceItem}>
                      <Text style={[localStyles.priceLabel, { color: colors.placeholder }]}>
                        Média
                      </Text>
                      <Text style={[localStyles.priceValue, { color: colors.text }]}>
                        R$ {item.averagePrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={localStyles.priceItem}>
                      <Text style={[localStyles.priceLabel, { color: colors.placeholder }]}>
                        Maior Preço
                      </Text>
                      <Text style={[localStyles.priceValue, { color: colors.error }]}>
                        R$ {item.highestPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[localStyles.comparisonDate, { color: colors.placeholder }]}>
                    Atualizado em: {formatDate(new Date(item.lastUpdated))}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.detailHeaderContainer}>
        <TouchableOpacity style={styles.detailBackButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.detailHeaderTitle, { color: colors.text }]}>
          Detalhes do Veículo
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={scale(24)} 
            color={isFavorite ? colors.primary : colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={[localStyles.heroContainer, { backgroundColor: vehicle.color }]}>
        <Ionicons name="car-sport" size={scale(60)} color="#fff" />
        <Text style={[localStyles.heroTitle, { color: '#fff' }]}>
          {vehicle.model}
        </Text>
        <Text style={[localStyles.heroPlate, { color: '#fff' }]}>
          {vehicle.plate}
        </Text>
      </View>

      {/* Informações Principais */}
      <View style={localStyles.mainInfoContainer}>
        <View style={[localStyles.infoCard, { backgroundColor: colors.card }]}>
          <View style={localStyles.infoRow}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <View style={localStyles.infoTextContainer}>
              <Text style={[localStyles.infoLabel, { color: colors.placeholder }]}>
                Próxima Manutenção
              </Text>
              <Text style={[localStyles.infoValue, { color: colors.text }]}>
                {maintenanceSchedule.length > 0 
                  ? formatDate(new Date(maintenanceSchedule[0].scheduledDate))
                  : 'Não agendada'}
              </Text>
            </View>
          </View>
          
          <View style={localStyles.infoRow}>
            <Ionicons name="construct" size={24} color={colors.primary} />
            <View style={localStyles.infoTextContainer}>
              <Text style={[localStyles.infoLabel, { color: colors.placeholder }]}>
                Última Manutenção
              </Text>
              <Text style={[localStyles.infoValue, { color: colors.text }]}>
                {serviceHistory.length > 0 
                  ? formatDate(new Date(serviceHistory[0].date))
                  : 'Nenhuma registrada'}
              </Text>
            </View>
          </View>
          
          <View style={localStyles.infoRow}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <View style={localStyles.infoTextContainer}>
              <Text style={[localStyles.infoLabel, { color: colors.placeholder }]}>
                Seguro
              </Text>
              <Text style={[localStyles.infoValue, { color: colors.text }]}>
                {insuranceQuote ? `${insuranceQuote.provider} - ${insuranceQuote.coverage}` : 'Não disponível'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recursos de Conveniência */}
      <View style={localStyles.convenienceContainer}>
        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
          Recursos de Conveniência
        </Text>
        
        <View style={localStyles.convenienceGrid}>
          <TouchableOpacity 
            style={[localStyles.convenienceItem, { backgroundColor: colors.card }]}
            onPress={() => setShowScheduleModal(true)}
          >
            <Ionicons name="calendar" size={32} color={colors.primary} />
            <Text style={[localStyles.convenienceItemText, { color: colors.text }]}>
              Agendar Manutenção
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.convenienceItem, { backgroundColor: colors.card }]}
            onPress={() => setShowHistoryModal(true)}
          >
            <Ionicons name="time" size={32} color={colors.primary} />
            <Text style={[localStyles.convenienceItemText, { color: colors.text }]}>
              Histórico
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.convenienceItem, { backgroundColor: colors.card }]}
            onPress={() => setShowComparisonModal(true)}
          >
            <Ionicons name="pricetag" size={32} color={colors.primary} />
            <Text style={[localStyles.convenienceItemText, { color: colors.text }]}>
              Comparativo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.convenienceItem, { backgroundColor: colors.card }]}
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={32} 
              color={isFavorite ? colors.primary : colors.primary} 
            />
            <Text style={[localStyles.convenienceItemText, { color: colors.text }]}>
              {isFavorite ? 'Remover Favorito' : 'Adicionar Favorito'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manutenções Agendadas */}
      {maintenanceSchedule.length > 0 && (
        <View style={localStyles.scheduledContainer}>
          <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
            Manutenções Agendadas
          </Text>
          
          {maintenanceSchedule.map((schedule) => (
            <View 
              key={schedule.id} 
              style={[localStyles.scheduledItem, { backgroundColor: colors.card }]}
            >
              <View style={localStyles.scheduledItemHeader}>
                <Text style={[localStyles.scheduledItemTitle, { color: colors.text }]}>
                  {schedule.serviceType}
                </Text>
                <View style={[
                  localStyles.statusBadge, 
                  { 
                    backgroundColor: 
                      schedule.status === 'completed' ? colors.success : 
                      schedule.status === 'cancelled' ? colors.error : 
                      colors.warning 
                  }
                ]}>
                  <Text style={localStyles.statusText}>
                    {schedule.status === 'completed' ? 'Concluído' : 
                     schedule.status === 'cancelled' ? 'Cancelado' : 
                     'Agendado'}
                  </Text>
                </View>
              </View>
              
              <Text style={[localStyles.scheduledItemDate, { color: colors.placeholder }]}>
                {formatDate(new Date(schedule.scheduledDate))}
              </Text>
              
              {schedule.notes && (
                <Text style={[localStyles.scheduledItemNotes, { color: colors.text }]}>
                  {schedule.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modais */}
      {renderScheduleModal()}
      {renderHistoryModal()}
      {renderComparisonModal()}
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  heroContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroPlate: {
    fontSize: 18,
    marginTop: 5,
  },
  mainInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  convenienceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  convenienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  convenienceItem: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  convenienceItemText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  scheduledContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scheduledItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduledItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  scheduledItemDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  scheduledItemNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyItemDate: {
    fontSize: 14,
  },
  historyItemDetails: {
    marginBottom: 8,
  },
  historyItemDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  nextServiceDate: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  comparisonItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  comparisonItemHeader: {
    marginBottom: 12,
  },
  comparisonItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonDate: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default VehicleDetailScreen;