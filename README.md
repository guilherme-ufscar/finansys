# Finansys 🚀

Finansys é um aplicativo de gestão financeira pessoal premium, desenvolvido com **React Native**, **Expo**, **TypeScript** e **NativeWind (Tailwind CSS)**. O foco do projeto é oferecer uma interface moderna, intuitiva e fluida (estilo Fintech) para ajudar usuários a controlarem suas finanças com eficiência.

## ✨ Funcionalidades

- **Dashboard Inteligente**: Visão geral do saldo, receitas e despesas com design premium.
- **Medidor de Saúde Financeira**: Um medidor visual dinâmico com ponteiro que indica a situação financeira em tempo real.
- **Gestão de Transações**: Registro completo de entradas e saídas, agrupadas por data e categorias.
- **Categorias Customizadas**: Crie suas próprias categorias com ícones seletivos e cores personalizadas.
- **Controle de Assinaturas**: Gerenciamento de custos fixos e recorrentes (Netflix, Spotify, etc.) com dashboard dedicado.
- **Lembretes Inteligentes**: Notificações locais agendadas para avisar sobre vencimentos de contas em 48 horas.
- **Gráficos de Distribuição**: Visualize para onde seu dinheiro está indo com gráficos de rosca (Donut Charts).
- **Haptic Feedback**: Respostas táteis ao realizar ações importantes para uma experiência mais imersiva.
- **Modo Escuro/Claro**: Suporte nativo a temas baseado nas configurações do sistema.

## 🛠️ Tecnologias Utilizadas

- [Expo](https://expo.dev/) - Framework para aplicações universais React.
- [React Native](https://reactnative.dev/) - Framework para apps nativos.
- [NativeWind v4](https://www.nativewind.dev/) - Tailwind CSS para React Native.
- [Zustand](https://github.com/pmndrs/zustand) - Gerenciamento de estado leve e escalável.
- [Moti](https://moti.fyi/) - Animações fluidas e poderosas.
- [Lucide React Native](https://lucide.dev/) - Conjunto de ícones modernos.
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) - Gerenciamento de lembretes e alertas.
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Persistência de dados localmente.

## 🚀 Como Executar o Projeto

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/guilherme-ufscar/finansys.git
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npx expo start
   ```

4. **Escaneie o QR Code**:
   - Use o app **Expo Go** no Android.
   - Use a **Câmera** no iOS.

## 📂 Estrutura de Pastas

- `/app`: Roteamento e telas (Expo Router).
- `/src/components`: Componentes visuais reutilizáveis (Gráficos, Medidores, etc).
- `/src/store`: Lógica de estado global e persistência (Zustand).
- `/src/lib`: Configurações de serviços externos (Notificações).
- `/assets`: Ícones, imagens e fontes do sistema.
