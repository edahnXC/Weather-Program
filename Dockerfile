# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install Node.js for Angular build
RUN apt-get update -yq && apt-get upgrade -yq && apt-get install -yq curl git nano
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Copy the csproj and restore dependencies
COPY ["WeatherProgram.csproj", "./"]
RUN dotnet restore "WeatherProgram.csproj"

# Copy the remaining source code
COPY . .

# Build and publish the application
# This will also trigger the Angular build thanks to our csproj Target
RUN dotnet publish "WeatherProgram.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the ASP.NET runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port your app runs on
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "WeatherProgram.dll"]
