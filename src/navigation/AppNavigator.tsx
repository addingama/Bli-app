/**
 * App Navigator - BliApp
 * Main navigation setup with bottom tabs and stack navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import type { RootStackParamList, BottomTabParamList } from '../types';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import StockScreen from '../screens/StockScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MenuScreen from '../screens/MenuScreen';
import BuyTransactionScreen from '../screens/BuyTransactionScreen';
import SellTransactionScreen from '../screens/SellTransactionScreen';
import TransactionSuccessScreen from '../screens/TransactionSuccessScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import LaporanKeuanganScreen from '../screens/LaporanKeuanganScreen';
import LaporanStokScreen from '../screens/LaporanStokScreen';
import LaporanBarangScreen from '../screens/LaporanBarangScreen';
import BarangListScreen from '../screens/BarangListScreen';
import BarangFormScreen from '../screens/BarangFormScreen';
import SupplierListScreen from '../screens/SupplierListScreen';
import SupplierFormScreen from '../screens/SupplierFormScreen';
import PembeliListScreen from '../screens/PembeliListScreen';
import PembeliFormScreen from '../screens/PembeliFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Bottom Tab Navigator
 */
function BottomTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowOpacity: 0.3,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'BliApp - Beranda',
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={StockScreen}
        options={{
          title: 'Stok Barang',
          tabBarLabel: 'Stok',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'package-variant' : 'package-variant-closed'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Riwayat Transaksi',
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: 'Menu',
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Stack Navigator
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BuyTransaction"
          component={BuyTransactionScreen}
          options={{
            title: 'Transaksi Pembelian',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="SellTransaction"
          component={SellTransactionScreen}
          options={{
            title: 'Transaksi Penjualan',
            headerBackTitle: 'Kembali',
            headerStyle: {
              backgroundColor: '#2196F3',
            },
          }}
        />
        <Stack.Screen
          name="TransactionSuccess"
          component={TransactionSuccessScreen}
          options={{
            title: 'Transaksi Berhasil',
            headerBackTitle: 'Kembali',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={{
            title: 'Detail Transaksi',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="LaporanKeuangan"
          component={LaporanKeuanganScreen}
          options={{
            title: 'Laporan Keuangan',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="LaporanStok"
          component={LaporanStokScreen}
          options={{
            title: 'Laporan Stok',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="LaporanBarang"
          component={LaporanBarangScreen}
          options={{
            title: 'Laporan per Barang',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="BarangList"
          component={BarangListScreen}
          options={{
            title: 'Kelola Barang',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="BarangForm"
          component={BarangFormScreen}
          options={({ route }) => ({
            title: route.params.mode === 'edit' ? 'Edit Barang' : 'Tambah Barang',
            headerBackTitle: 'Kembali',
          })}
        />
        <Stack.Screen
          name="SupplierList"
          component={SupplierListScreen}
          options={{
            title: 'Kelola Supplier',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="SupplierForm"
          component={SupplierFormScreen}
          options={({ route }) => ({
            title: route.params.mode === 'edit' ? 'Edit Supplier' : 'Tambah Supplier',
            headerBackTitle: 'Kembali',
          })}
        />
        <Stack.Screen
          name="PembeliList"
          component={PembeliListScreen}
          options={{
            title: 'Kelola Pembeli',
            headerBackTitle: 'Kembali',
          }}
        />
        <Stack.Screen
          name="PembeliForm"
          component={PembeliFormScreen}
          options={({ route }) => ({
            title: route.params.mode === 'edit' ? 'Edit Pembeli' : 'Tambah Pembeli',
            headerBackTitle: 'Kembali',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
