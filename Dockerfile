# Utilizar la imagen oficial del SDK de .NET 8 como entorno de construcción
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copiar todo el contenido del repositorio al contenedor
COPY . ./

# Restaurar las dependencias apuntando al archivo del proyecto anidado
RUN dotnet restore Meteorologico_API/Meteorologico_API/Meteorologico_API.csproj

# Compilar y publicar la aplicación en la carpeta 'out'
RUN dotnet publish Meteorologico_API/Meteorologico_API/Meteorologico_API.csproj -c Release -o out

# Configurar la imagen final de ejecución utilizando el entorno ASP.NET de .NET 8
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copiar la aplicación compilada desde la etapa anterior
COPY --from=build-env /app/out .

# Exponer el puerto 8080 (el puerto por defecto en .NET 8 y comúnmente usado en Railway)
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# Comando de inicio de la aplicación
ENTRYPOINT ["dotnet", "Meteorologico_API.dll"]
